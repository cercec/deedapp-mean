import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';

const httpOptions = {
	headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

const apiUrl = "/api/search";



@Injectable()

export class SearchService {

  results: Observable<any> = null;;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(
			`Backend returned code ${error.status}, ` +
			`body was: ${error.error}`);
		}
		// return an observable with a user-facing error message
		return throwError('Something bad happened; please try again later.');
		};

	private extractData(res: Response) {
		let body = res;
		return body || { };
	}

	searchPlainText(term: string): Observable<any> {
    const url = `${apiUrl}/${term}`;
    return this.http.get(url, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
	}

	searchSubstring(subString: string): Observable<any> {
		const url = `${apiUrl}/sub/${subString}`;
		return this.http.get(url, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
	}
	 
  clearCache(){
    this.results = null;
  }



}
