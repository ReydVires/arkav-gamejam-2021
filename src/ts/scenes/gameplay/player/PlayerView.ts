import { BaseView } from "../../../modules/core/BaseView";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

export class PlayerView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	constructor () {}

	create (): void {}

}