import { Subscription, Stream, default as xs } from 'xstream';
import fromEvent from 'xstream/extra/fromevent';
import { MainConnector } from '../types';
import {
  adapt
} from '@cycle/run/lib/adapt';

export const defaultMainConnector: MainConnector = (rx, tx) => {
  return (source$: Stream<any>) => {
    let receiver: Subscription;
    let sender: Subscription;
    return adapt(xs.create({
      start(observer) {
        rx.start();
        tx.start();
        sender = source$.subscribe({
          next(event) {
            tx.postMessage(event);
          },
          error(error) {
            console.error(error);
          },
          complete() {

          }
        })
        receiver = fromEvent(rx, 'message')
          .subscribe({
            next(event: MessageEvent) {
              observer.next(event.data);
            },
            error(error) {
              console.error(error);
            },
            complete() {

            }
          })
      },
      stop() {
        sender.unsubscribe();
        receiver.unsubscribe();
        rx.close();
        tx.close();
      }
    }))
  }
}