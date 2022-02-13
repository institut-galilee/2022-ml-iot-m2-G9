export enum AlertType {
    multipleScreen = 'multiple-screen-view',
    person = 'person-view', 
    multipleFace = 'multiple-face', 
    strangeFace = 'strange-face'
}
export default interface Alert {
    type: AlertType;
    sessionId: string;
    meta?: any;

}
