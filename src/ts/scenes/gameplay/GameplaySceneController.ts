import { AudioController } from "../../modules/audio/AudioController";
import { Audios } from "../../library/AssetAudio";
import { EventNames, GameplaySceneView } from "./GameplaySceneView";
import { DebugController } from "./debug/DebugController";
import { SceneInfo } from "../../info/SceneInfo";
import { PlayerController } from "./player/PlayerController";
import { BackgroundController } from "./background/BackgroundController";
import { ObstacleController } from "./obstacle/ObstacleController";
import { GameController } from "./game/GameController";

type OnCreateFinish = (...args: unknown[]) => void;

export class GameplaySceneController extends Phaser.Scene {

	view: GameplaySceneView;
	audioController: AudioController;
	debugController: DebugController;
	gameController: GameController;
	bgController: BackgroundController;
	playerController: PlayerController;
	obstacleController: ObstacleController;

	constructor () {
		super({key: SceneInfo.GAMEPLAY.key});
	}

	init (): void {
		this.toast.configure(this);
		this.view = new GameplaySceneView(this);
		this.audioController = AudioController.getInstance();
		this.debugController = new DebugController(this);
		this.gameController = new GameController();
		this.bgController = new BackgroundController(this);
		this.playerController = new PlayerController(this);
		this.obstacleController = new ObstacleController(this);

		this.debugController.init();
		this.gameController.init();
		this.bgController.init();
		this.playerController.init(
			this.bgController.displayPercentage(),
			this.bgController.getEdge()
		);
		this.obstacleController.init(
			this.bgController.displayPercentage(),
			this.bgController.getEdge()
		);

		this.gameController.onScoreChange((score) => {
			this.view.setScore(score);
		});

		this.playerController.registerOverlap(
			this.obstacleController.obstacles(),
			(player, obstacle) => {
				this.playerController.damaged();
				this.obstacleController.deactiveObstacle(obstacle, false);
			}
		);

		this.playerController.onDamaged((life) => {
			this.toast.show((life > 0) ? `Player damaged. ${life} chance left!` : `Game over!`);
			if (life) return;

			this.input.enabled = false;
			this.time.delayedCall(1500, () => {
				this.gameController.gameOverState();
				this.scene.restart(); // FIXME
			});
		});

		this.onClickStart(() => {
			this.view.hideTitleScreen();
			this.gameController.playState();
		});
		this.onPlaySFXClick(() => this.audioController.playSFX(Audios.sfx_click.key));
		this.onClickRestart(() => this.scene.start(SceneInfo.TITLE.key));

		this.onCreateFinish(() => {
			this.debugController.show(true);
		});
	}

	create (): void {
		this.view.create(
			this.bgController.displayPercentage()
		);
	}

	update (time: number, dt: number): void {
		if (this.view.restartKey.isDown) {
			this.view.event.emit(EventNames.onClickRestart);
		}
		if (Phaser.Input.Keyboard.JustDown(this.view.debugKey)) {
			// pass
		}

		if (this.gameController.state === "GAME") this.gameController.update(time, dt);
		this.bgController.update(time, dt);
		this.playerController.update(time, dt);
		if (this.gameController.state === "GAME") this.obstacleController.update(time, dt);
    
		if(this.obstacleController.getDeactivatedBonus()){
			this.playerController.healthBonus();
			this.obstacleController.setDeactivatedBonus(false);
		}
	}

	onPlaySFXClick (event: Function): void {
		this.view.event.on(EventNames.onPlaySFXClick, event);
	}

	onClickRestart (event: Function): void {
		this.view.event.on(EventNames.onClickRestart, event);
	}

	onClickStart (event: Function): void {
		this.view.event.on(EventNames.onClickStart, event);
	}

	onCreateFinish (event: OnCreateFinish): void {
		this.view.event.once(EventNames.onCreateFinish, event);
	}

}