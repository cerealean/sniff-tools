import { Controller } from "./controller";

const controller = new Controller(document);
const win = window as (Window & { sniffTools?: { initialized: boolean } });
if (win.sniffTools?.initialized) {
    controller.deInitialize();
}
controller.initialize();
win.sniffTools = {
    initialized: true
};
