import { BaseView } from "../../modules/core/BaseView";
import { ScreenUtilController } from "../../modules/screenutility/ScreenUtilController";
import { Assets } from "../../library/AssetGameplay";

export const enum EventNames {
	onPlaySFXClick = "onPlaySFXClick",
	onClickRestart = "onClickRestart",
	onCreateFinish = "onCreateFinish",
};

export class GameplaySceneView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _uiView: Phaser.GameObjects.Container;
	private _restartKey: Phaser.Input.Keyboard.Key;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	get restartKey (): Phaser.Input.Keyboard.Key {
		return this._restartKey;
	}

	create (): void {
		this._uiView = this._scene.add.container();
		this._restartKey = this._scene.input.keyboard.addKey('R');
		this.event.emit(EventNames.onCreateFinish, this._uiView);
	}

}