import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent, SubscriptionLike, PartialObserver } from 'rxjs'; import { map } from 'rxjs/operators';
import { NotificationsService } from 'angular2-notifications';
import { FirstnamesService } from '../../services/firstnames.service';
import { FirstNameObject, alphabet } from '../../models/deed-model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit, OnDestroy {


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
  formValue = [];
  navigationSubscription;


  constructor(private firstnamesService: FirstnamesService, private notificationsService: NotificationsService, private fb: FormBuilder, public auth: AuthService, private router: Router) {

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });


  }


  initializeComponent() {
    this.form = this.fb.group({});
    this.firstNames = [];
    this.firstNamesSorted = [];
    this.firstnamesService.getFirstNames().subscribe(data => {
      this.firstNamesSorted = this.getFirstnamesSorted(data);
      for (let index = 0; index < this.firstNamesSorted.length; index++) {
        const control = new FormControl;
        this.form.addControl(index.toString(), control);
      }
    });
  }

  getFirstnamesSorted(data) {
    let array = [];
    data.forEach(element => {
      let nameAndSex = { 'name': element.getFirstname(), 'sex': element.getSex(), 'idsAndFields': [{ 'id': element.getId(), 'field': element.getField() }] };
      let indexName = _.findIndex(array, (o) => { return o.name === nameAndSex.name });
      if (indexName === -1) {
        array.push(nameAndSex);
      } else {
        array[indexName].idsAndFields.push({ 'id': element.getId(), 'field': element.getField() });
      }
    });

    array.sort((a, b) => a.name.localeCompare(b.name, 'ru', {}));
    return array
  }


  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // avoid memory leaks here by cleaning up after ourselves. If we  
    // don't then we will continue to run our initialiseInvites()   
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }



  updateFirstName() {
    for (const key in this.form.value) {
      if (this.form.value[key] !== null) {
        const newName = this.form.value[key];
        this.firstNamesSorted[key].idsAndFields.forEach(element => {
          const placeholder = {};
          placeholder[element.field] = newName;
          this.formValue.push({ 'id': element.id, placeholder });
        });
      }
    }

    this.firstnamesService.updateFirstnames(this.formValue).subscribe(data => {
      if (Number.isInteger(data)) {
        if (data === 1) {
          this.notificationsService.success(
            'Success',
            'One document has been successfully updated.',
          );
        } else {
          this.notificationsService.success(
            'Success',
            data + ' documents have been successfully updated.',
          );
        }
      } else {
        this.notificationsService.error(
          'Error',
          data
        )
      }
    });

    setTimeout(() => {
      this.initializeComponent();
    }, 2000);
  }


}
