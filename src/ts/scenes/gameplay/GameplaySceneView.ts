import { IBaseView } from "../../modules/core/IBaseView";
import { ScreenUtilController } from "../../modules/screenutility/ScreenUtilController";
import { Assets } from "../../library/AssetGameplay";
import { Button } from "../../modules/gameobjects/Button";
import { Image } from "../../modules/gameobjects/Image";
import { FontAsset } from "../../library/AssetFont";

export const enum EventNames {
	onPlaySFXClick = "onPlaySFXClick",
	// onClickLogo = "onClickLogo",
	onClickRestart = "onClickRestart",
	onCreateFinish = "onCreateFinish",
};

export class GameplaySceneView implements IBaseView {

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