import { LoadingSceneView } from "./LoadingSceneView";
import { LoaderHelper } from "../../helper/LoaderHelper";
import { Assets as LoadingAsset } from "../../library/AssetLoading";
import { Assets as OrientationAsset } from "../../library/AssetOrientation";
import { Assets as ErrorAsset } from "../../library/AssetError";
import { Assets as GameplayAsset } from "../../library/AssetGameplay";
import { Audios as AudioAsset } from "../../library/AssetAudio";
import { CustomTypes } from "../../../types/custom";
import { SceneInfo } from "../../info/SceneInfo";
import { CONFIG } from "../../info/GameInfo";

export class LoadingSceneController extends Phaser.Scene {

	view: LoadingSceneView;

	constructor () {
		super({key:SceneInfo.LOADING.key});

		this.onCompleteLoadBoot = this.onCompleteLoadBoot.bind(this);
		this.onCompleteLoad = this.onCompleteLoad.bind(this);
	}

	init (): void {
		this.view = new LoadingSceneView(this);
	}

	preload (): void {
		this.loadBootResources();
	}

	create (): void {}

	loadBootResources (): void {
		this.load.once('complete', this.onCompleteLoadBoot);

		// MOUNT LOADING ASSETS FILE
		LoaderHelper.LoadAssets(this, LoadingAsset as CustomTypes.Asset.ObjectAsset);
		this.load.start(); // Execute: onCompleteLoadBoot
	}

	onCompleteLoadBoot (): void {
		this.view.create();
		this.load.on('progress', (value: number) => {
			this.view.updateLoading(value);
		});

		this.loadResources();
	}

	loadResources (): void {
		this.load.once('complete', this.onCompleteLoad);

		// LOAD ALL GAME FILE HERE!
		LoaderHelper.LoadAssets(this, OrientationAsset as CustomTypes.Asset.ObjectAsset);
		LoaderHelper.LoadAssets(this, ErrorAsset as CustomTypes.Asset.ObjectAsset);
		LoaderHelper.LoadAssets(this, GameplayAsset as CustomTypes.Asset.ObjectAsset);
		LoaderHelper.LoadAssets(this, AudioAsset as CustomTypes.Asset.ObjectAsset);
		this.load.start(); // Execute: onCompleteLoad
	}

	onCompleteLoad (): void {
		this.load.removeAllListeners();
		this.scene.launch(SceneInfo.ERROR.key);
		if (CONFIG.ON_DEBUG) this.scene.launch(SceneInfo.DEBUG.key);
		this.scene.start(SceneInfo.GAMEPLAY.key);
		this.scene.launch(SceneInfo.ORIENTATION.key);
	}

}