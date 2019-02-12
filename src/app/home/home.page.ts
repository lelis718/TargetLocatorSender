import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// tslint:disable-next-line:max-line-length
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';
import { Observable} from 'rxjs';
import { NGXLogger, NGXLoggerMonitor, NGXLogInterface, NgxLoggerLevel } from 'ngx-logger';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})

export class HomePage {

    static url = 'http://192.168.1.3:3000/device-positions/0001';

    private config: BackgroundGeolocationConfig = {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        debug: true, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };

    protected lastSendDate: Date;
    protected logStream: string[] = [];

    constructor(private backgroundGeolocation: BackgroundGeolocation, private http: HttpClient, private _logger: NGXLogger) {
        this._logger.info('initializing...');
        try {
            this.backgroundGeolocation.configure(this.config).then((location: BackgroundGeolocationResponse) => {
                this._logger.debug('backgroundGeolocation Worked');

                this._logger.debug('getting location',location);
                this.getPositionAndSend(location).subscribe(c => {
                    this.backgroundGeolocation.finish();
                });
            });

            // start recording location
            this.backgroundGeolocation.start();

            // If you wish to turn OFF background-tracking, call the #stop method.
            this.backgroundGeolocation.stop();

        } catch (e) {
            this._logger.error(e);
        }
    }

    private getPositionAndSend(location: BackgroundGeolocationResponse): Observable<any> {
        this._logger.debug('Saving the position online...');
        return Observable.create(c => {
            this.http.post(HomePage.url, {
                latitude: location.latitude,
                longitude: location.longitude
            }).subscribe((result) => {
                this.lastSendDate = new Date();
                this._logger.debug('done', this.lastSendDate);
                c.complete();
            });
        });
    }

}

