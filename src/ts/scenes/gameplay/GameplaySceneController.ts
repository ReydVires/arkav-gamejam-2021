import { AudioController } from "../../modules/audio/AudioController";
import { CameraKeyList } from "../../info/GameInfo";
import { Audios } from "../../library/AssetAudio";
import { EventNames, GameplaySceneView } from "./GameplaySceneView";
import { CameraController } from "./camera/CameraController";
import { DebugController } from "./debug/DebugController";
import { SceneInfo } from "../../info/SceneInfo";
import { PlayerController } from "./player/PlayerController";
import { BackgroundController } from "./background/BackgroundController";

type OnCreateFinish = (...args: unknown[]) => void;

export class GameplaySceneController extends Phaser.Scene {

	view: GameplaySceneView;
	audioController: AudioController;
	cameraController: CameraController;
	debugController: DebugController;
	playerController: PlayerController;
	bgController: BackgroundController;

	constructor () {
		super({key: SceneInfo.GAMEPLAY.key});
	}

	init (): void {
		this.view = new GameplaySceneView(this);
		this.audioController = AudioController.getInstance();
		this.cameraController = new CameraController(this);
		this.debugController = new DebugController(this);
		this.bgController = new BackgroundController(this);
		this.playerController = new PlayerController(this);

		this.cameraController.init();
		this.debugController.init();
		this.bgController.init();
		this.playerController.init(
			this.bgController.displayPercentage()
		);

		this.onPlaySFXClick(() => this.audioController.playSFX(Audios.sfx_click.key));
		this.onClickRestart(() => {
			this.scene.start(SceneInfo.TITLE.key);
		});
		this.onCreateFinish((uiView: Phaser.GameObjects.Container) => {
			this.cameraController.registerGameobjectInCamera(uiView, CameraKeyList.UI);
			this.debugController.show(true);
		});
	}

	create (): void {
		this.view.create();
	}

	update (time: number, dt: number): void {
		if (this.view.restartKey.isDown) {
			this.view.event.emit(EventNames.onClickRestart);
		}
		this.cameraController.update(time, dt);
		this.bgController.update(time, dt);
		this.playerController.update(time, dt);
	}

	onPlaySFXClick (event: Function): void {
		this.view.event.on(EventNames.onPlaySFXClick, event);
	}

	onClickRestart (event: Function): void {
		this.view.event.on(EventNames.onClickRestart, event);
	}

	onCreateFinish (event: OnCreateFinish): void {
		this.view.event.once(EventNames.onCreateFinish, event);
	}

}