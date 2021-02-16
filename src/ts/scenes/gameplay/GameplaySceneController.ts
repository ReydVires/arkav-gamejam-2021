import { AudioController } from "../../modules/audio/AudioController";
import { Audios } from "../../library/AssetAudio";
import { EventNames, GameplaySceneView } from "./GameplaySceneView";
import { DebugController } from "./debug/DebugController";
import { SceneInfo } from "../../info/SceneInfo";
import { PlayerController } from "./player/PlayerController";
import { BackgroundController } from "./background/BackgroundController";
import { ObstacleController } from "./obstacle/ObstacleController";
import { GameController } from "./game/GameController";
import { CONFIG, GameState } from "../../info/GameInfo";

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
				this.obstacleController.deactiveObstacle(obstacle);
			}
		);

		this.playerController.onDamaged((life) => {
			(CONFIG.ON_DEBUG) && this.toast.show((life > 0) ? `Player damaged. ${life} chance left!` : `Game over!`);
			if (life) return;

			this.audioController.playSFX(Audios.sfx_lose.key, { volume: 0.9, rate: 1.15 });
			this.input.enabled = false;
			this.gameController.gameOverState();

			this.obstacleController.stopObstacleVelocity();

			this.time.delayedCall(1650, () => {
				// TODO: Implement gameover panel
				this.fadeOutRestart();
			});
		});

		this.obstacleController.onPlaySFX((type) => {
			const prefixSFX = "sfx_destroy_";
			this.audioController.playSFX(prefixSFX + type, { volume: 1.5 });
		});

		this.onClickStart(() => {
			this.view.hideTitleScreen();
			this.gameController.playState();
		});
		this.onPlaySFXClick(() => this.audioController.playSFX(Audios.sfx_click.key, { volume: 1.5 }));
		this.onClickRestart(() => this.fadeOutRestart());

		this.onCreateFinish(() => {
			this.playBGMWhenReady();
			this.debugController.show(true);
		});
	}

	create (): void {
		this.view.create(
			this.bgController.displayPercentage()
		);
	}

	fadeOutRestart (): void {
		const cam = this.cameras.main;
		cam.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
			this.scene.restart();
		});
		cam.fadeOut(350);
	}

	playBGMWhenReady (): void {
		if (!this.sound.locked) {
			this.audioController.playBGM(Audios.bgm_title.key, false);
			return;
		}
		// This will wait for 'unlocked' to fire and then play
		this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
			this.audioController.playBGM(Audios.bgm_title.key);
		});
	}

	update (time: number, dt: number): void {
		if (Phaser.Input.Keyboard.JustUp(this.view.restartKey)) {
			this.view.event.emit(EventNames.onClickRestart);
		}

		if (this.gameController.state !== GameState.GAMEOVER) this.bgController.update(time, dt);

		if (this.gameController.state === GameState.PLAYING) {
			this.gameController.update(time, dt);
			this.playerController.update(time, dt);
			this.obstacleController.update(time, dt);
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