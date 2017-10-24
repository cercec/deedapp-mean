import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NoteService } from '../../services/note.service';
import { DatePipe } from '@angular/common';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
  
  constructor(public dialog: MatDialog) {}

  ngOnInit() {
  }

  openNotes(): void {
    let dialogRef = this.dialog.open(NoteDialog, {
      width: '800px',
      disableClose: false
    });

  }

}


@Component({
  selector: 'app-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.css']
})
export class NoteDialog implements OnInit {

  noteForm: FormGroup;
  user: FormControl;
  date: FormGroup;
  content: FormControl;
  noteValue;
  note;
  notes;
  contentClass = this.contentClass;
  editMode = false;
  noteId = null;

  constructor(public dialogRef: MatDialogRef<NoteDialog>, private noteService: NoteService, private fb: FormBuilder, public auth: AuthService) { }


  ngOnInit() {
    this.initForm();
    this.showNotes();
 
  }

  initForm() {
    this.noteForm = this.fb.group({
      user: [''],
      date: [''],
      content: ['']
    })
  }

  showNotes() {
    this.noteService.getNotes().subscribe(notes => {
      this.notes = notes;
    });
  }


  getUser() {
    return localStorage.getItem('userName');
  }

  onSubmit() {
    let time = Date.now()
    let userName = this.getUser();
		this.noteForm.patchValue({
      date: time, 
      user: userName
    });
    this.noteValue = JSON.stringify(this.noteForm.value);
    console.log(this.editMode);
    if (this.editMode) {
      this.noteService.updateNote(this.noteId, this.noteValue).subscribe(note => {
        this.showNotes();
        this.noteId = null;
        this.editMode = false;
      });
    } else {
      this.noteService.saveNote(this.noteValue).subscribe(note => {
        this.showNotes();
      });
    }
    this.noteForm.reset();
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onEditClick(id) {
    this.editMode = true;
    this.noteId = id;
    this.noteService.getNote(id).subscribe(note => {
      this.note = note;
      this.noteForm.patchValue({
        content: this.note.content
      });
    });
  }

  onDeleteClick(id) {
    this.noteService.deleteNote(id).subscribe(note => {
      this.showNotes();
    });
  }

}
