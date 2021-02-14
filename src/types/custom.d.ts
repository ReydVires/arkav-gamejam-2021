import { AssetType } from "../ts/info/AssetType";

export declare namespace CustomTypes {

    type CONFIG = {
        VERSION: string,
        MODE: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION',
        ENABLE_LOG: boolean,
        ON_DEBUG: boolean,
        ENABLE_PHYSICS_DEBUG: boolean,
        BASE_API_URL: string,
        BASE_ASSET_URL: string,
        AUTO_CANVAS_RESIZE: boolean
    }

    namespace General {

        type KeyValuePair<K, V> = {
            key: K,
            value: V
        }

    }

    namespace Asset {

        type BaseAssetInfoType = {
            key: string,
            type: AssetType
        }

        type AssetInfoType = BaseAssetInfoType & {
            url: string | string[],
            width?: number,
            height?: number,
            config?: object
        }

        type AnimationInfoType = BaseAssetInfoType & {
            spritesheetRef: string,
            start: number,
            end: number,
            frameSpeed: number,
            loop?: true
        }

        interface ObjectAsset {
            [key: string]: AssetInfoType
        }

        interface AnimationAsset {
            [key: string]: AnimationInfoType
        }

    }

    namespace Gameplay {

        type State = "GAME" | "TITLE" | "GAMEOVER"

    }

}