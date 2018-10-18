import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent, SubscriptionLike, PartialObserver } from 'rxjs'; import { map } from 'rxjs/operators';
import { NotificationsService } from 'angular2-notifications';
import { FirstnamesService } from '../../services/firstnames.service';
import { FirstNameObject, alphabet } from '../../models/deed-model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {


  public options = {
    position: ['bottom', 'right'],
    timeOut: 2000,
    showProgressBar: false,
    pauseOnHover: false,
    animate: 'fade'
  }
  form: FormGroup;
  firstNames;
  firstNamesSorted;
  alphabet = alphabet;
  nameForm;
  control;

  constructor(private firstnamesService: FirstnamesService, private notificationsService: NotificationsService, private fb: FormBuilder) { }

  ngOnInit() {
    this.form = new FormGroup({});
    this.firstNames = [];
    this.firstNamesSorted = [];
    this.firstnamesService.getFirstNames().subscribe(data => this.firstNamesSorted = this.getFirstnamesSorted(data));
  }




  getFirstnamesSorted(data) {
    let array = [];
    data.forEach(element => {
      let nameAndSex = {'name':element.getFirstname(), 'sex':element.getSex(), 'ids':[element.getId()]}
      if (array.indexOf(nameAndSex.name) === -1) {
        array.push(nameAndSex);
      } else {
        let i = array.indexOf(nameAndSex);
        array[i].ids.push(element.getId());
      }
    });

    array.sort((a, b) => a.name.localeCompare(b.name, 'ru', {ignorePunctuation: true}));
    return array
  }


  updateFirstName() {
    console.log(this.form.value);
  }


}
