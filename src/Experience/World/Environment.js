import * as THREE from 'three'
import Experience from "../Experience";

const SUNLIGHT = {
    intensity: 4,
    position: [3.5, 2, -1.25],
    shadowFar: 15,
    shadowMapSize: 1024,
    shadowNormalBias: 0.05,
}
export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Environment')
        }

        this.setSunLight()
    }

    setSunLight()
    {
        this.sunLight = new THREE.DirectionalLight('#ffffff', SUNLIGHT.intensity)
        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = SUNLIGHT.shadowFar
        this.sunLight.shadow.mapSize.set(SUNLIGHT.shadowMapSize, SUNLIGHT.shadowMapSize)
        this.sunLight.shadow.normalBias = SUNLIGHT.shadowNormalBias
        this.sunLight.position.set(...SUNLIGHT.position)
        this.scene.add(this.sunLight)

        // Debug
        if (this.debug.active)
        {
            this.debugFolder.add(this.sunLight, 'intensity')
                .name('sunLightIntensity').min(0).max(10).step(0.001)
        }
    }
}