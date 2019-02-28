$(document).ready(function() {
    var i18n = new I18n();
    i18n.select("en");
    var ui = new LitepadUI();
    ui.registerHandler();
    ui.onLoad();
    $(window).resize(function() {
        ui.resize();
    });
});

class Shared {
    constructor() {
        this.file = "#file";
    }
}

// global handler 
class LitepadUI {
    constructor() {
        this.modals = new ModalHandler();
        this.editor = new Editor();
        this.sidebar = new Sidebar();
        this.converter = new showdown.Converter();
        this.ajax = new AjaxHandler();
        this.file = new Shared().file;
        this.nav = "#nav_collapse";
        this.conNav = "#nav_container";
        this.btnApp = "#sidebar_open";
        this.btnSave = "#btnSave";
        this.btnParse = "#btnParse";
        this.btnEdit = "#btnEdit";
        this.btnPrint = "#btnPrint";
        this.content = "#content";
        this.parsedCtnt = "#parsed";
        this.liOpen = ".noteList";
        this.fork = "#fork";
        this.mlFile = "ml-3";
    }

    saveNote() {
        if($(this.file).html() == "") {
            $.announce.danger("The filename is empty");
            return;
        }

        var data = {
            noteName: $(this.file).html(),
            noteSave: "1", 
            noteText: this.editor.mde.value()
        };

        this.ajax.post("text", data, this.editor.mde.value());
    }

    openNote(file) {
        var data = {
            noteName: file,
            noteLoad: "1"
        };

        this.ajax.get("text", data, "File couldn't be opened!")
            // substr prevent to load an not needed '\n' char at begin
            .then((data) => this.editor.mde.value(data.substr(1,data.length-1)));
        $(this.file).html(file);
        $(this.modals.mOpen).modal('hide');
    }

    parseMarkdown() {
        var text = this.editor.mde.value();
        var html = this.converter.makeHtml(text);
        $(this.parsedCtnt).html(html);
        $(this.content).hide();
        $(this.parsedCtnt).show();
    }

    parseToPdf() {
        var text = this.editor.mde.value();
        var html = this.converter.makeHtml(text);

        var data = {
            noteName: $(this.file).html(),
            notePrint: "1",
            noteText: html
        };

        this.ajax.post("html", data, "File couldn't parsed to pdf print", "pdf");
    }

    onLoad() {
        if($(this.nav).is(":hidden")) {
            this.hideContent();
        }
    }

    hideContent() {
        $(this.btnApp).show();
        $(this.conNav).removeClass("container");
        $(this.file).addClass(this.mlFile);
        $(this.content).removeClass("container");
        $(this.content).addClass("container-fluid");
        $(this.fork).removeClass("d-flex").hide();
    }
    
    resize() {
        if($(this.nav).is(":hidden")) {
            if($(this.btnApp).is(":hidden")) {
                this.hideContent();
            }
        } else {
            if($(this.btnApp).is(":visible")) {
                $(this.btnApp).hide();
                $(this.fork).addClass("d-flex").show();
                $(this.conNav).addClass("container");
                $(this.file).removeClass(this.mlFile);
                $(this.content).removeClass("container-fluid");
                $(this.content).addClass("container");
            }
        }
    }

    showEditor() {
        $(this.content).show();
        $(this.parsedCtnt).hide();
    }

    registerHandler() {
        var self = this;
        this.modals.registerModalHandler();
        this.editor.registerEditorHandler();
        this.sidebar.registerSidebarHandler();
        this.registerOnClick(self);

    }

    registerOnClick(self) {
        $(this.btnSave).click(function() {
            self.saveNote();
        });

        $(this.btnParse).click(function() {
            self.parseMarkdown();
        });

        $(this.btnEdit).click(function() {
            self.showEditor();
        });

        $(this.modals.mOpen).on("click", this.liOpen, function() {
            self.openNote($(this).html());
        });

        $(this.sidebar.btnSave).click(function() {
            self.saveNote();
        });

        $(this.sidebar.btnParse).click(function() {
            self.parseMarkdown();
        });

        $(this.sidebar.btnEdit).click(function() {
            self.showEditor();
        });
        
        $(this.btnPrint).click(function() {
            self.parseToPdf();
        });

        $(this.sidebar.btnPrint).click(function() {
            self.parseToPdf();
        });
    }
}

class ModalHandler {
    constructor() {
        this.ajax = new AjaxHandler();
        this.file = new Shared().file;
        this.mAdd = "#modalAdd";
        this.mOpen = "#modalOpen";
        this.mMove = "#modalMove";
        this.mDelete = "#modalDelete";
        this.mSettings = "#modalSettings";

        this.inAdd = "#inModalAdd";
        this.btnAdd = "#btnModalAdd";
        this.inRename = "#inModalRename";
        this.btnRename = "#btnModalRename";
        this.ulOpen = "#ulNoteOpen";
        this.btnDelete = "#btnModalDelete";
        this.btnSettings = "#btnModalSettings";
        this.liOpen = ".noteList";

        // settings
        this.cbCookies = "#cbCookies";
        this.inMaxNotes = "#inMaxNotes";
        this.selPdfFont = "#selPdfFont";
        this.selLang = "#selLang";
    }

    addNote() {
        if($(this.inAdd).val() == "") {
            $.announce.warning("Please enter a name for your new note");
            return;
        }

        var data = {
            noteName: $(this.inAdd).val(), 
            noteAdd: "1"
        };

        this.ajax.post("text", data, "File couldn't add!"); 
        $(this.file).html($(this.inAdd).val());
        $(this.inAdd).val("");
    }

    listNotes(data) {
        $(this.ulOpen).html(data);
    }

    loadNotes() {
        var data = {
            noteName: "1",
            noteOpen: "1"
        };
        this.ajax.get("html", data, "File list couldn't load!")
            .then((data) => this.listNotes(data));
    }
    
    moveNote() {
        if($(this.inRename).val() == "") {
            $.announce.warning("Please enter a valid name for your new note");
            return;
        }

        var data = {
            noteName: $(this.file).html(),
            noteMove: $(this.inRename).val()
        };

        this.ajax.post("text", data, "File couldn't renamed!");

        $(this.file).html($(this.inRename).val());
        $(this.inRename).val("");
    }

    deleteNote() {
        var file = $(this.file).html();

        var data = { 
            noteName: file, 
            noteDelete: "1"
        };

        this.ajax.post("text", data, "File couldn't deleted");
        $(this.file).html("");
    }

    getSettings() {
        var data = {
            settings: "1",
        };

    }

    loadSettings(json) {

    }


    saveSettings() {

        let obj = {
            "cookies": $(this.cbCookies).is(':checked'),
            "lang": $(this.selLang).val(),
            "uiFgColor": "#fff",
            "uiBgColor": "#fff",
            "maxFiles": $(this.inMaxNotes).val(),
            "pdfFont": $(this.selPdfFont).val(),
            "editor": "SimpleMDE"
        };

        let json = JSON.stringify(obj);
        console.log(json);


        let data = {
            settings: json
        };
    }

    registerModalHandler() {
        var self = this;

        $(this.btnAdd).click(function() {
            self.addNote();
        });

        $(this.btnRename).click(function() {
            self.moveNote();
        });

        $(this.btnDelete).click(function() {
            self.deleteNote();
        });

        //$(this.mOpen).bind('isVisible', self.listNotes);
        $(this.mOpen).on('show.bs.modal', function() {
            self.loadNotes();
        });
    }
}

class Sidebar {
    constructor() {
        this.nav_open = "#sidebar_open";
        this.nav_close = "#sidebar_close";
        this.nav = "#sidebar";
        this.links = ".s_link";
        this.btnSave = "#s_save";
        this.btnParse = "#s_parse";
        this.btnEdit = "#s_editor";
        this.btnPrint = "#s_print";
    }

    open() {
        $(this.nav).width(250);
    }

    close() {
        $(this.nav).width(0);
    }

    registerSidebarHandler() {
        var self = this;

        $(this.nav_open).click(function() {
            self.open();
        });

        $(this.nav_close).click(function() {
            self.close();
        });

        $(this.links).click(function() {
            self.close();
        });
    }
}

class Editor {
    constructor() {
        this.elem = "#editor";
        this.mde = this.createEditor();
    }

    createEditor() {
        var simpleMde = new SimpleMDE({
            element: $(this.elem)[0],
            autofocus: true,
            spellChecker: false,
            initialValue: "Welcome to Lpad!",
        });
        return simpleMde;
    }

    registerEditorHandler() {
    }
}
