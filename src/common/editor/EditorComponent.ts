// https://github.com/ajaxorg/ace-builds/issues/129
import * as ace from "brace";

import "brace/mode/javascript";
import "brace/theme/monokai"
import "brace/ext/language_tools"

import {fromEvent, merge, Observable, Subject} from 'rxjs/index';
import {filter} from "rxjs/operators";
import {SandboxAutocomplete} from './SandboxAutocomplete';

export class EditorComponent {

    runCode$ = new Subject<string>();

    private editor: any;

    get runButtonClick$(): Observable<Event> {
        return fromEvent(document.getElementById('run'), 'click');
    }

    get ctrlEnter$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(document, 'keypress')
            .pipe(
                filter(event => this.isWindowsCtrlEnter(event) || this.isUnixCtrlEnter(event))
            );
    }

    constructor() {
        this.initEditor();

        merge(this.runButtonClick$, this.ctrlEnter$)
            .subscribe(() => {
                this.runCode$.next(this.editor.getValue());
            });
    }

    private isWindowsCtrlEnter(event: KeyboardEvent): boolean {
        return event.keyCode === 10 && event.ctrlKey;
    }

    private isUnixCtrlEnter(event: KeyboardEvent): boolean {
        return event.keyCode === 13 && (event.ctrlKey || event.metaKey);
    }

    private initEditor() {
        const langTools = ace.acequire("ace/ext/language_tools");
        this.editor = ace.edit('editor');

        this.editor.session.setMode('ace/mode/javascript');
        this.editor.setTheme('ace/theme/monokai');

        this.editor.setOptions({
            fontSize: 18,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });

        langTools.addCompleter(new SandboxAutocomplete());
    }
}