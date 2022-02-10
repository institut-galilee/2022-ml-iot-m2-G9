export enum AlertType {
    multipleScreen = 'multiple-screen-view',
    person = 'person-view'
}
export default interface Alert {
    type: AlertType;
    sessionId: string;
    meta?: any;

}
