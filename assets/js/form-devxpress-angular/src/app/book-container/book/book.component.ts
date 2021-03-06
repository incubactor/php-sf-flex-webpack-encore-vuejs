import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import { Observable } from 'rxjs/Observable'
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/takeUntil'
import {ActivatedRoute} from "@angular/router";
import {WizardBook} from "../../shared/services/wizard-book";
import {BroadcastChannelApi} from "../../shared/services/broadcast-channel-api";
import {Book} from "../../../entities/library/book";

@Component({
  selector: 'my-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit, OnDestroy {
    protected ngUnsubscribe: Subject<void> = new Subject()
    protected book: Book
    protected isLoading = true

    constructor(private route: ActivatedRoute, private bookService: WizardBook, private broadcastChannel: BroadcastChannelApi) {}

    ngOnInit(): void {
        // Observe the params from activatedRoute AND then load the story
        this.route.paramMap
            .takeUntil(this.ngUnsubscribe)
            .subscribe(params => {
                const bookId = params.get('id')

                if (bookId === null) {
                    throw new Error('Cannot access Book without any selected one')
                }

                // subscribe to the book Observable
                this.bookService
                    .book
                    .subscribe((res: Book) => this.book = res)

                // then do the main call
                this.bookService
                    .get(parseInt(bookId, 10))
                    .takeUntil(this.ngUnsubscribe)
                    .subscribe((res: Book) => {
                        this.isLoading = false
                    })
            })
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next()
        this.ngUnsubscribe.complete()
    }

    sendMessage() {
        this.broadcastChannel.ping()
    }

    sendBookToParent(newTitle) {
        this.book.title = newTitle

        this.broadcastChannel.sendBook(this.book)
    }

    isSecondWindow() {
        return window['name'] === 'second-screen'
    }
}
