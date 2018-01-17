import { Component, OnInit, Input } from '@angular/core';
import { DeedService } from '../../services/deed.service';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Male, Female, BodyCorporate, OtherParticipant, Registrator, Fee, gender, transactionTypes, currencies, socialBody, relationtoagents, agentActionsList, whatList, immovablePropertyList, shareList, whomList, asWhomList, activityList, typeTaxList, counterAgentActionsList } from '../../models/deed-model'
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import * as _ from 'lodash';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-add-deed',
    templateUrl: './add-deed.component.html',
    styleUrls: ['./add-deed.component.css']
})

export class AddDeedComponent implements OnInit {

    deedForm: FormGroup;
    agent: FormGroup;
    counterAgent: FormGroup;
    coAgent: FormGroup;
    coCounterAgent: FormGroup;
    collectiveCoAgent: FormGroup;
    collectiveCoCounterAgent: FormGroup;
    agentTransactionObject: FormGroup;
    counterAgentTransactionObject: FormGroup;
    agentTransactionObjects: FormArray;
    counterAgentTransactionObjects: FormArray;
    accusationAgainstAgent: FormControl;
    accusationAgainstCounterAgent: FormControl;
    juridicalProcedureStage: FormControl;
    scribe: FormGroup;
    registrator: FormGroup;
    chattels: FormGroup;
    debt: FormGroup;
    dependent: FormGroup;
    forfeit: FormGroup;
    fugitiveSouls: FormGroup;
    goods: FormGroup;
    immovableProperty: FormGroup;
    money: FormGroup;
    parent: FormGroup;
    responsibilities: FormGroup;
    shareFromEstate: FormGroup;
    souls: FormGroup;
    other: FormGroup;
    what: FormArray;
    whom: FormGroup;
    asWhom: FormControl;
    whoInherits: FormControl;
    coAgentNumberWhoInherits: FormControl;
    otherAgentAction: FormControl;
	otherImmovablePropertyType: FormControl;
	otherImmovablePropertyShare: FormControl;
    otherShareFromEstate: FormControl;
	asWhomValue;

	deed;
    deedValue = '';
    agentSex = '';
	agentData;
    counterAgentData;
    socialStatus;
    relationToAgent;
    relationToCounterAgent;
    otherSocialStatus;
    otherRelationToAgent;
    otherRelationToCounterAgent;
    counterAgentSex = '';
    coAgentSex = '';
    coCounterAgentSex = '';
    agentAction;
    counterAgentAction;
    agentTransactionType = '';
    counterAgentTransactionType = '';
    lastDeed;
    lastDeedCode;
    lastDeedRef;
    lastDeedDate;
    lastDeedRegistrationDate;
    selectedObject;
    value;
    indexValues = [];
    selectedAgentActionItem = '';
    
    gender = gender;
    socialBody = socialBody;
    agentActionsList = agentActionsList;
    whatList = whatList;
    transactionTypes = transactionTypes;
    relationtoagents = relationtoagents;
    currencies = currencies;
    immovablePropertyList = immovablePropertyList;
    shareList = shareList;
    whomList = whomList;
    asWhomList = asWhomList;
    activityList = activityList;
    typeTaxList = typeTaxList;
    counterAgentActionsList = counterAgentActionsList;
    registratorList = this.registratorList;
    selectedRegistrators;

    collectiveCoAgentOn = this.collectiveCoAgentOn;
    collectiveCoCounterAgentOn = this.collectiveCoCounterAgentOn;
    scribeOn = this.scribeOn;
    registratorOn = this.registratorOn;
    selectedAction = this.selectedAction;
    selectedValue = this.selectedValue;
    selectedAsWhomValue = this.selectedAsWhomValue;
    selectedCounterAction = this.selectedCounterAction;
    counterAgentField = this.counterAgentField;
    
    public options = {
        position: ['bottom', 'left'],
        timeOut: 2000,
        showProgressBar: false,
        pauseOnHover: false,
        animate: 'fromLeft'
    }

    constructor(private fb: FormBuilder, 
                private deedService: DeedService, 
                private router: Router, 
                private notificationsService: NotificationsService,
                public auth: AuthService) { }

    ngOnInit() {
        this.initForm();
        this.selectedAction = '';
        this.selectedCounterAction = '';
        this.counterAgentField = 'text';
    }

    // Create the form

    initForm() {

        this.deedForm = this.fb.group({
            deedCode: ['', Validators.required],
            deedRef: ['', Validators.required],
            deedDate: this.fb.group({
                day: [''],
                month: [''],
                year: ['']
            }),
            deedName: [''],
            deedLanguage: ['russian'],
            agentSex: ['male'],
            agent: this.fb.group({}),
            coAgents: this.fb.array([]),
            counterAgentSex: ['male'],
            counterAgent: this.fb.group({}),
            coCounterAgents: this.fb.array([]),
            transactions: this.fb.array([
                this.initTransaction(),
            ]),
            whitnesses: this.fb.array([]),
            sureties: this.fb.array([]),
            otherParticipants: this.fb.array([]),
            registrationDate: [''],
            fees: this.fb.group({
				tax: this.fb.group({
					roubles: [''],
					altyn: [''],
					denga: [''],
					collected: ['yes']	
				}),
				fee: this.fb.group({
					roubles: [''],
					altyn: [''],
					denga: [''],
					collected: ['yes']
				})
            }),
            verbatimCitations: [''],
            researcherNotes: [''],
            complete: [false]
        })

    }

    classComplete() {
        if (this.deedForm.get('complete').value === true) {
            return 'labelTrue';
        }
    }

    setToggleNo() {
        this.deedForm.patchValue({complete: false});
    }

    insertLastDeedCode() {
        this.deedService.getLastDeed().subscribe(result => {
            this.lastDeed = result;
            if (this.lastDeed.length < 1) {
                this.deedForm.patchValue({
                    deedCode: "No deed saved yet"
                });
            }
            else {
                this.lastDeedCode = this.lastDeed[0].deedCode;
                this.deedForm.patchValue({
                    deedCode: this.lastDeedCode
                });
            }
        });
    }

    insertLastDeedRef() {
        this.deedService.getLastDeed().subscribe(result => {
            this.lastDeed = result;
            if (this.lastDeed.length < 1) {
                this.deedForm.patchValue({
                    deedRef: "No deed saved yet"
                });
            }
            else {
                this.lastDeedRef = this.lastDeed[0].deedRef;
                this.deedForm.patchValue({
                    deedRef: this.lastDeedRef
                });
            }
        });
    }

    insertLastDeedDate() {
        this.deedService.getLastDeed().subscribe(result => {
            this.lastDeed = result;
            if (this.lastDeed.length < 1) {
                this.deedForm.patchValue({
                    deedDate: {
                        day: "no",
                        month: "deed",
                        year: "saved"
                    }
                });
            }
            else {
                this.lastDeedDate = this.lastDeed[0].deedDate;
                this.deedForm.patchValue({
                    deedDate: {
                        day: this.lastDeedDate.day,
                        month: this.lastDeedDate.month,
                        year: this.lastDeedDate.year
                    }
                });
            }
        });
    }

    insertLastResgitrationDate() {
        this.deedService.getLastDeed().subscribe(result => {
            this.lastDeed = result;
            if (this.lastDeed.length < 1) {
                this.deedForm.patchValue({
                    deedRef: "No deed saved yet"
                });
            }
            else {
                this.lastDeedRegistrationDate = this.lastDeed[0].registrationDate;
                this.deedForm.patchValue({
                    registrationDate: this.lastDeedRegistrationDate
                });
            }
        });
    }

    // AGENT METHODS

    getAgentSex() {
        return this.deedForm.get('agentSex').value;
    }

    updateAgent() {
        this.agentSex = this.deedForm.get('agentSex').value;

        switch (this.agentSex) {
            case 'male': {
                this.agent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    lastName: [''],
                    relatedTo: ['']
                })
                break;
            }
            case 'female': {
                this.agent = this.fb.group({
                    familyStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    relatedTo: [''],
                    referentMale: this.fb.group({
                        relationshipToAgent: [''],
                        geogrStatus: [''],
                        socialStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relatedTo: ['']
                    })
                })
                break;
            }
            case 'body-corporate': {
                this.agent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    corporationName: [''],
                    nbParticipants: [''],
                    names: ['']
                })
                break;
            }
            default: {
                break;
            }
        }
        this.deedForm.setControl('agent', this.agent);
    }

    updateSocialStatusAgent() {
        this.socialStatus = this.agent.get('socialStatus').value;
        if (this.socialStatus == 'other') {
            this.otherSocialStatus = new FormControl;
            this.agent.addControl('otherSocialStatus', this.otherSocialStatus);
            return true;
        }
    }


    // COUNTER AGENT METHODS

    getCounterAgentSex() {
        return this.deedForm.get('counterAgentSex').value;
    }

    updateCounterAgent() {
        this.counterAgentSex = this.deedForm.get('counterAgentSex').value;

        switch (this.counterAgentSex) {
            case 'male': {
                this.counterAgent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    lastName: [''],
                    relatedTo: ['']
                })
                break;
            }
            case 'female': {
                this.counterAgent = this.fb.group({
                    familyStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    relatedTo: [''],
                    referentMale: this.fb.group({
                        relationshipToCounterAgent: [''],
                        geogrStatus: [''],
                        socialStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relatedTo: ['']
                    })
                })
                break;
            }
            case 'body-corporate': {
                this.counterAgent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    corporationName: [''],
                    nbParticipants: [''],
                    names: ['']
                })
                break;
            }
            default: {
                break
            }
        }
        this.deedForm.setControl('counterAgent', this.counterAgent);
    }

    updateSocialStatusCounterAgent() {
        this.socialStatus = this.counterAgent.get('socialStatus').value;
        if (this.socialStatus == 'other') {
            this.otherSocialStatus = new FormControl;
            this.counterAgent.addControl('otherSocialStatus', this.otherSocialStatus);
            return true;
        }
    }


    // Co-Agents Methods (init, add and remove)

    initCoAgent() {
        return this.fb.group({
            coAgentSex: ['']
        });
    }

    updateCoAgent(i) {
        this.coAgentSex = this.deedForm.controls['coAgents']['controls'][i].get('coAgentSex').value;

        switch (this.coAgentSex) {
            case 'male': {
                this.coAgent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    lastName: [''],
                    relatedTo: ['']
                })
                break;
            }
            case 'female': {
                this.coAgent = this.fb.group({
                    familyStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    relatedTo: [''],
                    referentMale: this.fb.group({
                        relationshipToCoAgent: [''],
                        geogrStatus: [''],
                        socialStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relatedTo: ['']
                    })
                })
                break;
            }
            case 'body-corporate': {
                this.coAgent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    corporationName: [''],
                    nbParticipants: [''],
                    names: ['']
                })
                break;
            }
            default: {
                break
            }
        }
        this.deedForm.controls['coAgents']['controls'][i].setControl('coAgent', this.coAgent);
    }

    getCoAgentSex(i) {
        return this.deedForm.controls['coAgents']['controls'][i].get('coAgentSex').value;
    }

    addCoAgent() {
        const control = <FormArray>this.deedForm.controls['coAgents'];
        control.push(this.initCoAgent());
    }

    removeCoAgent(i: number) {
        const control = <FormArray>this.deedForm.controls['coAgents'];
        control.removeAt(i);
    }

    updateSocialStatusCoAgent() {
        this.socialStatus = this.coAgent.get('socialStatus').value;
        if (this.socialStatus == 'other') {
            this.otherSocialStatus = new FormControl;
            this.coAgent.addControl('otherSocialStatus', this.otherSocialStatus);
            return true;
        }
    }

	insertAgentData(i) {
		this.agentData = this.deedForm.get('agent').value;
		this.deedForm.controls['coAgents']['controls'][i]['controls'].coAgent.controls.referentMale.patchValue(this.agentData); 
	}

    // Co-Counter Agents Methods (init, add and remove)

    initCoCounterAgent() {
        return this.fb.group({
            coCounterAgentSex: ['']
        });
    }

    updateCoCounterAgent(i) {
        this.coCounterAgentSex = this.deedForm.controls['coCounterAgents']['controls'][i].get('coCounterAgentSex').value;

        switch (this.coCounterAgentSex) {
            case 'male': {
                this.coCounterAgent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    lastName: [''],
                    relatedTo: ['']
                })
                break;
            }
            case 'female': {
                this.coCounterAgent = this.fb.group({
                    familyStatus: [''],
                    firstName: [''],
                    patronyme: [''],
                    relatedTo: [''],
                    referentMale: this.fb.group({
                        relationshipToCoCounterAgent: [''],
                        geogrStatus: [''],
                        socialStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relatedTo: ['']
                    })
                })
                break;
            }
            case 'body-corporate': {
                this.coCounterAgent = this.fb.group({
                    geogrStatus: [''],
                    socialStatus: [''],
                    corporationName: [''],
                    nbParticipants: [''],
                    names: ['']
                })
                break;
            }
            default: {
                break
            }
        }
        this.deedForm.controls['coCounterAgents']['controls'][i].setControl('coCounterAgent', this.coCounterAgent);
    }

    getCoCounterAgentSex(i) {
        return this.deedForm.controls['coCounterAgents']['controls'][i].get('coCounterAgentSex').value;
    }

    addCoCounterAgent() {
        const control = <FormArray>this.deedForm.controls['coCounterAgents'];
        control.push(this.initCoCounterAgent());
    }

    removeCoCounterAgent(i: number) {
        const control = <FormArray>this.deedForm.controls['coCounterAgents'];
        control.removeAt(i);
    }

    updateSocialStatusCoCounterAgent() {
        this.socialStatus = this.coCounterAgent.get('socialStatus').value;
        if (this.socialStatus == 'other') {
            this.otherSocialStatus = new FormControl;
            this.coCounterAgent.addControl('otherSocialStatus', this.otherSocialStatus);
            return true;
        }
    }

    insertCounterAgentData(i) {
		this.counterAgentData = this.deedForm.get('counterAgent').value;
		this.deedForm.controls['coCounterAgents']['controls'][i]['controls'].coCounterAgent.controls.referentMale.patchValue(this.counterAgentData); 
	}

    // Collective Co-Agent Methods

    addCollectiveCoAgent() {
        this.collectiveCoAgent = this.fb.group({
            relationToAgent: [''],
            numberOfParticipants: [''],
            statusesNames: ['']
        });

        this.deedForm.addControl('collectiveCoAgent', this.collectiveCoAgent);
        return this.collectiveCoAgentOn = true;
    }

    removeCollectiveCoAgent() {
        this.deedForm.removeControl('collectiveCoAgent');
        return this.collectiveCoAgentOn = false;
    }


    updateRelationToAgent() {
        this.relationToAgent = this.collectiveCoAgent.get('relationToAgent').value;
        if (this.relationToAgent === 'other') {
            this.otherRelationToAgent = new FormControl;
            this.collectiveCoAgent.addControl('otherRelationToAgent', this.otherRelationToAgent);
            return true;
        }
    }

    // Collective Co Counter-Agent Methods

    addCollectiveCoCounterAgent() {
        this.collectiveCoCounterAgent = this.fb.group({
            relationToCounterAgent: [''],
            numberOfParticipants: [''],
            statusesNames: ['']
        });

        this.deedForm.addControl('collectiveCoCounterAgent', this.collectiveCoCounterAgent);
        return this.collectiveCoCounterAgentOn = true;
    }

    removeCollectiveCoCounterAgent() {
        this.deedForm.removeControl('collectiveCoCounterAgent');
        return this.collectiveCoCounterAgentOn = false;
    }


    updateRelationToCounterAgent() {
        this.relationToCounterAgent = this.collectiveCoCounterAgent.get('relationToCounterAgent').value;
        if (this.relationToCounterAgent == 'other') {
            this.otherRelationToCounterAgent = new FormControl;
            this.collectiveCoCounterAgent.addControl('otherRelationToCounterAgent', this.otherRelationToCounterAgent);
            return true;
        }
    }



    // Transaction Methods (init, add and remove)

    initTransaction() {
        return this.fb.group({
            agentAction: [''],
            agentTransactionObjects: this.fb.array([]),
            agentTransactionObjectType: [''],
            counterAgentAction: [''],
            counterAgentTransactionObjects: this.fb.array([]),
            counterAgentTransactionObjectType: [''],
            advancePayment: ['no'],
            contractConditions: [''],
            contractDuration: [''],
            forfeit: ['']
        });
    }

    updateAgentAction(i) {
        this.agentAction = this.deedForm.controls.transactions['controls'][i].get('agentAction').value;            
             
        this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.reset();

        if (this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.length > 0) {
            this.agentTransactionObjects = this.fb.array([]);
            this.deedForm.controls.transactions['controls'][i].setControl('agentTransactionObjects', this.agentTransactionObjects);
        }

        if (this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects.length > 0) {
            this.counterAgentTransactionObjects = this.fb.array([]);
            this.deedForm.controls.transactions['controls'][i].setControl('counterAgentTransactionObjects', this.counterAgentTransactionObjects);
        }

		if (this.deedForm.controls.transactions['controls'][i].controls.accusationAgainstAgent) {
			this.deedForm.controls.transactions['controls'][i].removeControl('accusationAgainstAgent');
			this.deedForm.controls.transactions['controls'][i].removeControl('accusationAgainstCounterAgent');
            this.deedForm.controls.transactions['controls'][i].removeControl('juridicalProcedureStage');
		}

        switch (this.agentAction) {

            case 'cedes': {
                this.selectedAction = 'what';
                this.selectedCounterAction = 'what';
                this.counterAgentField = 'select'
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('cedes');
                break;
            }
            case 'exchanges': {
                this.selectedAction = 'what';
                this.selectedCounterAction = 'what';
                this.counterAgentField = 'select';
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('exchanges');
                break;
            }
            case 'mortgages': {
                this.selectedAction = 'what';
                this.selectedCounterAction = 'what';
                this.counterAgentField = 'select';
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('lends');
                break;
            }
            case 'puts to rent': {
                this.selectedAction = 'what';
                this.selectedCounterAction = 'what';
                this.counterAgentField = 'select';
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('pays');
                break;
            }
            case 'sells': {
                this.selectedAction = 'what';
                this.selectedCounterAction = 'what';
                this.counterAgentField = 'select';
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('pays');
                break;
            }
            case 'donates':
            case 'borrows': {
                this.selectedAction = 'what';
                this.selectedCounterAction = '';
                this.counterAgentField = '';
                break;
            }
            case 'agrees to divide property': {
                this.selectedAction = '';
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('agrees to divide property');
                break;
            }
            case 'agrees to marry-off': {
                this.selectedAction = 'whom';
                this.counterAgentField = 'selectMarry';
                break;
            }
            case 'engages': {
                this.selectedAction = 'asWhom';
                this.selectedCounterAction = 'what';
                this.counterAgentField = 'select';
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('pays');
                break;
            }
            case 'bequeaths': {
                this.selectedAction = 'bequeaths';
                this.counterAgentField = '';
                break;
            }
            case 'settles': {
                this.selectedAction = 'settles';
                this.selectedCounterAction = 'settles';
                this.counterAgentField = 'select';
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('settles');
                this.accusationAgainstAgent = new FormControl;
                this.accusationAgainstCounterAgent = new FormControl;
                this.juridicalProcedureStage = new FormControl;
                this.deedForm.controls.transactions['controls'][i].addControl('accusationAgainstAgent', this.accusationAgainstAgent);
                this.deedForm.controls.transactions['controls'][i].addControl('accusationAgainstCounterAgent', this.accusationAgainstCounterAgent);
                this.deedForm.controls.transactions['controls'][i].addControl('juridicalProcedureStage', this.juridicalProcedureStage);
                break;
            }
            case 'agrees to marry': {
                this.selectedAction = '';
                this.counterAgentField = 'selectMarry';
                break;
            }
            case 'manumits': {
                this.deedForm.controls.transactions['controls'][i].controls.counterAgentAction.patchValue('pays');
                this.selectedAction = '';
                this.selectedCounterAction = 'what';
                this.counterAgentField = 'select';
                break;
            }
            case 'agrees to divorce':
            case 'promises':
            case 'elects':
            case 'signs receipt': {
                this.selectedAction = '';
                this.selectedCounterAction = '';
                this.counterAgentField = 'text';				
                break;
            }
            case 'other': {
                this.otherAgentAction = new FormControl;
                this.deedForm.controls.transactions['controls'][i].addControl('otherAgentAction', this.otherAgentAction);
                this.counterAgentField = 'text';
                this.selectedAction = 'other'; 				
                break;
            }
            default: {
                this.selectedAction = '';
                this.selectedCounterAction = '';
                this.counterAgentField = 'text';				
                break;
            }
        }
    }

    updateCounterAgentAction(i: number) {
        this.counterAgentAction = this.deedForm.controls.transactions['controls'][i].get('counterAgentAction').value;
        switch (this.counterAgentAction) {

            case 'cedes':
            case 'exchanges':
            case 'lends':
            case 'pays': {
                this.selectedCounterAction = 'what';
                break;
            }
            case 'agrees to marry-off': {
                this.selectedCounterAction = 'whom';
                break;
            }
            case 'settles': {
                this.selectedCounterAction = 'settles';
                break;
            }
            default: {
                this.selectedCounterAction = '';
                break;
            }
        }
    }
	
	
	// AGENT AS WHOM methods
	
	selectedAsWhom(i:number, value) {
        
        if (this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.length > 0) {
            this.removedAsWhom(i);
        }
        switch (value) {
            case 'as hired worker': {
                this.agentTransactionObject = this.fb.group({
                    asWhom: ['as hired worker'],
                    toDoWhat: ['']
                });
                break;
            }
            case 'in household': {
                this.agentTransactionObject = this.fb.group({
                    asWhom: ['in household'],
                    withFamily: ['']
                });
                break;
            }
            case 'as contractor': {
                this.agentTransactionObject = this.fb.group({
                    asWhom: ['as contractor'],
                    activity: ['']
                });
                break;
            }
            case 'as tax-farmer': {
                this.agentTransactionObject = this.fb.group({
                    asWhom: ['as tax-farmer'],
                    type: [''],
                    description: [''],
                    annualRent: this.fb.group({
                        rubli: [''],
                        altyny: [''],
                        dengi: ['']
                    })
                });
                break;
            }
            case 'other': {
                this.agentTransactionObject = this.fb.group({
                    asWhom: ['other'],
                    other: ['']
                });
                break;
            }
            default: {
                this.agentTransactionObject = this.fb.group({
                    asWhom: [value]
                });
                break;
            }
        };
        this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.push(this.agentTransactionObject);
        this.selectedAsWhomValue = value;

    }

    removedAsWhom(i: any): void {
        this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.removeAt(0);
    }

    // AGENT WHOM Select Methods

    refreshValueWhom(value: any, i: number) {
        this.value = value;
    }

    selectedWhom(value: any, i:number) {
        if (this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.length > 0) {
            this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.removeAt(0);
        }
        switch (value) {
            case 'parent': {
                this.agentTransactionObject = this.fb.group({
                    parent: this.fb.group({
                        coAgentNumber: ['']
                    })
                });
                break;
            }
            case 'dependent': {
                this.agentTransactionObject = this.fb.group({
                    dependent: this.fb.group({
                        familyStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relationToAgent: ['']
                    })
                });
                break;
            }
            default: {
                break;
            }
        };
        this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.push(this.agentTransactionObject);
    }

    removedWhom(value: any, i: any): void {
        this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.removeAt(0);
    }

    // AGENT WHAT Select Methods


    selectedWhat(i:number) {
        switch (this.deedForm.controls.transactions['controls'][i].get('agentTransactionObjectType').value) {
            case 'chattels': {
                this.agentTransactionObject = this.fb.group({
                    chattels: this.fb.group({
                        type: [''],
                        origin: [''],
                        description: [''],
                        price: ['']
                    })
                });
                break;
            }
            case 'debt': {
                this.agentTransactionObject = this.fb.group({
                    debt: this.fb.group({
                        amount: this.fb.group({
                            moscowSilver: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            }),
                            chekhi: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            })
                        }),
                        debtorName: [''],
                        debtDate: ['']
                    })
                });
                break;
            }
            case 'dependent': {
                this.agentTransactionObject = this.fb.group({
                    dependent: this.fb.group({
                        familyStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relationToAgent: ['']
                    })
                });
                break;
            }
            case 'forfeit': {
                this.agentTransactionObject = this.fb.group({
                    forfeit: this.fb.group({
                        moscowSilver: this.fb.group({
                            rubli: [''],
                            altyny: [''],
                            dengi: ['']
                        }),
                        chekhi: this.fb.group({
                            rubli: [''],
                            altyny: [''],
                            dengi: ['']
                        })
                    })
                });
                break;
            }
            case 'fugitive souls': {
                this.agentTransactionObject = this.fb.group({
                    fugitiveSouls: this.fb.group({
                        juridicalStatus: [''],
                        numberOfSouls: this.fb.group({
                            male: [''],
                            female: [''],
                            operator: [''],
                            households: ['']
                        }),
                        names: [''],
                        yearsOfRent: ['']
                    })
                });
                break;
            }
            case 'goods': {
                this.agentTransactionObject = this.fb.group({
                    goods: this.fb.group({
                        type: [''],
                        description: [''],
                        price: this.fb.group({
                            moscowSilver: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            }),
                            chekhi: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            })
                        })
                    })
                });
                break;
            }
            case 'immovable property': {
                this.agentTransactionObject = this.fb.group({
                    immovableProperty: this.fb.group({
                        type: [''],
                        share: [''],
                        origin: [''], 
                        localisation: [''],
                        neighbours: [''],
                        surface: this.fb.group({
                            chetiVpole: [''],
                            sazheni: this.fb.group({
                                x: [''],
                                y: ['']
                            }),
                        }),
                        population: this.fb.group({
                            male: [''],
                            female: [''],
                            operator: [''],
                            households: ['']
                        }),
                        buildings: [''],
                        appurtenances: ['']
                    })
                });
                break;
            }
            case 'money': {
                this.agentTransactionObject = this.fb.group({
                    money: this.fb.group({
                        amount: this.fb.group({
                            moscowSilver: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            }),
                            chekhi: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            })
                        })
                    })
                });
                break;
            }
            case 'parent': {
                this.agentTransactionObject = this.fb.group({
                    parent: this.fb.group({
                        coAgentNumber: ['']
                    })
                });
                break;
            }
            case 'responsibilities': {
                this.agentTransactionObject = this.fb.group({
                    responsabilities: this.fb.group({
                        description: ['']
                    })
                });
                break;
            }
            case 'share from estate': {
                this.agentTransactionObject = this.fb.group({
                    shareFromEstate: this.fb.group({
                        share: [''],
                        description: ['']
                    })
                });
                break;
            }
            case 'souls': {
                this.agentTransactionObject = this.fb.group({
                    souls: this.fb.group({
                        juridicalStatus: [''],
                        numberOfSouls: this.fb.group({
                            male: [''],
                            female: [''],
                            operator: [''],
                            households: ['']
                        }),
                        names: ['']
                    })
                });
                break;
            }
            case 'other': {
                this.agentTransactionObject = this.fb.group({
                    other: ['']
                });
                break;
            }

        } // END SWITCH

		if (this.deedForm.controls.transactions['controls'][i].get('agentAction').value === 'bequeaths') {
			this.whoInherits = new FormControl;
        	this.agentTransactionObject.addControl('whoInherits', this.whoInherits);
		}
        this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.push(this.agentTransactionObject);
		this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjectType.reset();
    }

	removeAgentTransactionObject(i, j) {
        this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjectType.reset();
        this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects.removeAt(j);
    }


	// IMMOVABLE PROPERTY ACTIONS


	updateAgentImmovablePropertyType(i: number, j:number) {
        if (this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects['controls'][j].controls.immovableProperty.get('type').value === 'other') {
            this.otherImmovablePropertyType = new FormControl;
            this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects['controls'][j].controls.immovableProperty.addControl('otherImmovablePropertyType', this.otherImmovablePropertyType);
			return true;
        }
	}
	updateCounterAgentImmovablePropertyType(i: number, j:number) {
		if (this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects['controls'][j].controls.immovableProperty.get('type').value === 'other') {
            this.otherImmovablePropertyType = new FormControl;
            this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects['controls'][j].controls.immovableProperty.addControl('otherImmovablePropertyType', this.otherImmovablePropertyType);
			return true;
        }
	}

	updateAgentImmovablePropertyShare(i: number, j:number) {
        if (this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects['controls'][j].controls.immovableProperty.get('share').value === 'other') {
            this.otherImmovablePropertyShare = new FormControl;
            this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects['controls'][j].controls.immovableProperty.addControl('otherImmovablePropertyShare', this.otherImmovablePropertyShare);
			return true;
        }
	}
	updateCounterAgentImmovablePropertyShare(i: number, j:number) {
		if (this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects['controls'][j].controls.immovableProperty.get('share').value === 'other') {
            this.otherImmovablePropertyShare = new FormControl;
            this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects['controls'][j].controls.immovableProperty.addControl('otherImmovablePropertyShare', this.otherImmovablePropertyShare);
			return true;
        }
	}

    // SHARE FROM ESTATE ACTIONS
    updateAgentShareFromEstate(i: number, j: number) {
        if (this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects['controls'][j].controls.shareFromEstate.get('share').value === 'other') {
            this.otherShareFromEstate = new FormControl;
            this.deedForm.controls.transactions['controls'][i].controls.agentTransactionObjects['controls'][j].controls.shareFromEstate.addControl('otherShareFromEstate', this.otherShareFromEstate);
            return true;
        }
    }

    updateCounterAgentShareFromEstate(i: number, j:number) {
        if (this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects['controls'][j].controls.shareFromEstate.get('share').value === 'other') {
            this.otherShareFromEstate = new FormControl;
            this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects['controls'][j].controls.shareFromEstate.addControl('otherShareFromEstate', this.otherShareFromEstate);
            return true;
        }
    }

    // COUNTER AGENT WHOM Select Methods


    selectedCounterWhom(value: any, i:number) {
        console.log(value);
		if (this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects.length > 0) {
            this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects.removeAt(0);
        }
        switch (value) {
            case 'parent': {
                this.counterAgentTransactionObject = this.fb.group({
                    parent: this.fb.group({
                        coCounterAgentNumber: ['']
                    })
                });
                break;
            }
            case 'dependent': {
                this.counterAgentTransactionObject = this.fb.group({
                    dependent: this.fb.group({
                        familyStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relationToAgent: ['']
                    })
                });
                break;
            }
            default: {
                break;
            }
        };
        this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects.push(this.counterAgentTransactionObject);
    }

    removedCounterWhom(value: any, i: any): void {
        this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects.removeAt(0);
    }

    // WHAT Select Methods

    selectedCounterWhat(i:number) {
        switch (this.deedForm.controls.transactions['controls'][i].get('counterAgentTransactionObjectType').value) {
            case 'chattels': {
                this.counterAgentTransactionObject = this.fb.group({
                    chattels: this.fb.group({
                        type: [''],
                        origin: [''],
                        description: [''],
                        price: ['']
                    })
                });
                break;
            }
            case 'debt': {
                this.counterAgentTransactionObject = this.fb.group({
                    debt: this.fb.group({
                        amount: this.fb.group({
                            moscowSilver: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            }),
                            chekhi: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            })
                        }),
                        debtorName: [''],
                        debtDate: ['']
                    })
                });
                break;
            }
            case 'dependent': {
                this.counterAgentTransactionObject = this.fb.group({
                    dependent: this.fb.group({
                        familyStatus: [''],
                        firstName: [''],
                        patronyme: [''],
                        lastName: [''],
                        relationToAgent: ['']
                    })
                });
                break;
            }
            case 'forfeit': {
                this.counterAgentTransactionObject = this.fb.group({
                    forfeit: this.fb.group({
                        moscowSilver: this.fb.group({
                            rubli: [''],
                            altyny: [''],
                            dengi: ['']
                        }),
                        chekhi: this.fb.group({
                            rubli: [''],
                            altyny: [''],
                            dengi: ['']
                        })
                    })
                });
                break;
            }
            case 'fugitive souls': {
                this.counterAgentTransactionObject = this.fb.group({
                    fugitiveSouls: this.fb.group({
                        juridicalStatus: [''],
                        numberOfSouls: this.fb.group({
                            male: [''],
                            female: [''],
                            operator: [''],
                            households: ['']
                        }),
                        names: [''],
                        yearsOfRent: ['']
                    })
                });
                break;
            }
            case 'goods': {
                this.counterAgentTransactionObject = this.fb.group({
                    goods: this.fb.group({
                        type: [''],
                        description: [''],
                        price: this.fb.group({
                            moscowSilver: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            }),
                            chekhi: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            })
                        })
                    })
                });
                break;
            }
            case 'immovable property': {
                this.counterAgentTransactionObject = this.fb.group({
                    immovableProperty: this.fb.group({
                        type: [''],
                        share: [''],
                        origin: [''], 
                        localisation: [''],
                        neighbours: [''],
                        surface: this.fb.group({
                            chetiVpole: [''],
                            sazheni: this.fb.group({
                                x: [''],
                                y: ['']
                            }),
                        }),
                        population: this.fb.group({
                            male: [''],
                            female: [''],
                            operator: [''],
                            households: ['']
                        }),
                        buildings: [''],
                        appurtenances: ['']
                    })
                });
                break;
            }
            case 'money': {
                this.counterAgentTransactionObject = this.fb.group({
                    money: this.fb.group({
                        amount: this.fb.group({
                            moscowSilver: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            }),
                            chekhi: this.fb.group({
                                rubli: [''],
                                altyny: [''],
                                dengi: ['']
                            })
                        })
                    })
                });
                break;
            }
            case 'parent': {
                this.counterAgentTransactionObject = this.fb.group({
                    parent: this.fb.group({
                        coAgentNumber: ['']
                    })
                });
                break;
            }
            case 'responsibilities': {
                this.counterAgentTransactionObject = this.fb.group({
                    responsabilities: this.fb.group({
                        description: ['']
                    })
                });
                break;
            }
            case 'share from estate': {
                this.counterAgentTransactionObject = this.fb.group({
                    shareFromEstate: this.fb.group({
                        share: [''],
                        description: ['']
                    })
                });
                break;
            }
            case 'souls': {
                this.counterAgentTransactionObject = this.fb.group({
                    souls: this.fb.group({
                        juridicalStatus: [''],
                        numberOfSouls: this.fb.group({
                            male: [''],
                            female: [''],
                            operator: [''],
                            households: ['']
                        }),
                        names: ['']
                    })
                });
                break;
            }
            case 'other': {
                this.counterAgentTransactionObject = this.fb.group({
                    other: ['']
                });
                break;
            }

        } // END SWITCH

        this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects.push(this.counterAgentTransactionObject);
        this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjectType.reset();
    }

	removeCounterAgentTransactionObject(i, j) {
        this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjectType.reset();
        this.deedForm.controls.transactions['controls'][i].controls.counterAgentTransactionObjects.removeAt(j);
    }



    addTransaction() {
        const control = <FormArray>this.deedForm.controls['transactions'];
        control.push(this.initTransaction());
    }

    removeTransaction(i: number) {
        const control = <FormArray>this.deedForm.controls['transactions'];
        control.removeAt(i);
    }


    // Whitnesses Methods (init, add, remove)

    initWhitness() {

        return this.fb.group({
            whitness: this.fb.group({
                geogrStatus: [''],
                socialStatus: [''],
                firstName: [''],
                patronyme: [''],
                lastName: [''],
                relatedTo: ['']
            })
        });
    }

    addWhitness() {
        const control = <FormArray>this.deedForm.controls['whitnesses'];
        control.push(this.initWhitness());
    }

    removeWhitness(i: number) {
        const control = <FormArray>this.deedForm.controls['whitnesses'];
        control.removeAt(i);
    }


    // Sureties Methods (init, add, remove)

    initSurety() {

        return this.fb.group({
            surety: this.fb.group({
                geogrStatus: [''],
                socialStatus: [''],
                firstName: [''],
                patronyme: [''],
                lastName: [''],
                relatedTo: ['']
            })
        });
    }

    addSurety() {
        const control = <FormArray>this.deedForm.controls['sureties'];
        control.push(this.initSurety());
    }

    removeSurety(i: number) {
        const control = <FormArray>this.deedForm.controls['sureties'];
        control.removeAt(i);
    }

    // Scribe Methods (add, remove)


    addScribe() {

        this.scribe = this.fb.group({
            geogrStatus: [''],
            socialStatus: [''],
            firstName: [''],
            patronyme: [''],
            lastName: [''],
            relatedTo: ['']
        });

        this.deedForm.addControl('scribe', this.scribe);
        return this.scribeOn = true;
    }

    removeScribe() {
        this.deedForm.removeControl('scribe');
        return this.scribeOn = false;
    }


    // Other Participants Methods (init, add, remove)

    initOtherParticipant() {

        return this.fb.group({
            otherParticipant: this.fb.group({
                role: [''],
                geogrStatus: [''],
                socialStatus: [''],
                firstName: [''],
                patronyme: [''],
                lastName: [''],
                relatedTo: ['']
            })
        });
    }

    addOtherParticipant() {
        const control = <FormArray>this.deedForm.controls['otherParticipants'];
        control.push(this.initOtherParticipant());
    }

    removeOtherParticipant(i: number) {
        const control = <FormArray>this.deedForm.controls['otherParticipants'];
        control.removeAt(i);
    }

    // Registrator Methods (add, remove)


    addRegistrator() {

        this.registrator = this.fb.group({
            firstName: [''],
            patronyme: [''],
            lastName: [''],
            relatedTo: ['']
        });
        this.deedForm.addControl('registrator', this.registrator);
        this.registratorList = [];

        this.deedService.getDeeds().subscribe(deeds => {

            deeds.forEach(deed => {
                
                if (deed.registrator && !_.some(this.registratorList, deed.registrator)) {
                    this.registratorList.push(deed.registrator);
                }
                        
            });
            this.registratorList = _.sortBy(this.registratorList, ['firstName', 'patronyme', 'lastName']);
            console.log(this.registratorList);
        
        });

        return this.registratorOn = true;
    }

    removeRegistrator() {
        this.deedForm.removeControl('registrator');
        this.registratorList = [];
        return this.registratorOn = false;
    }

    updateRegistrator(i) {
        this.deedForm.controls.registrator.reset();
        this.deedForm.patchValue({
            registrator: this.registratorList[i]
        });
    }



     // Submit the form

    onSubmit() {
        this.deedValue = JSON.stringify(this.deedForm.value);
        this.deedService.saveDeed(this.deedValue).subscribe(deed => {
            this.deed = deed;
            if (this.deed._id) {
                this.notificationsService.success(
                    'Success',
                    'The deed has been successfully saved in the database with id ' + this.deed._id,
                );
            }
        });
        setTimeout(() => {
            this.router.navigate(['/list']);
        }, 2000);
    }


}
