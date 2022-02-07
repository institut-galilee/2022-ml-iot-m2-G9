export enum AlertType {
    multipleScreen = 'multiple-screen',
    person = 'person'
}
export default interface Alert {
    type: AlertType;
}
