import * as THREE from 'three'
import Terrain from './Terrain'
import terrainVertexShader from '../../shaders/terrain/vertex.glsl'
import terrainFragmentShader from '../../shaders/terrain/fragment.glsl'

export default class SolidTerrain extends Terrain 
{
    constructor()
    {
        super()
    }

    setMaterial()
    {
        const mainTerrain = this.experience.world.terrain
        this.uniforms.uBigHillElevation = mainTerrain.uniforms.uBigHillElevation
        this.uniforms.uBigHillFrequency = mainTerrain.uniforms.uBigHillFrequency
        this.uniforms.uRoadElevation = mainTerrain.uniforms.uRoadElevation
        this.uniforms.uValleyDepth = mainTerrain.uniforms.uValleyDepth

        // Create the solid terrain material with shared uniforms
        this.material = new THREE.ShaderMaterial({
            wireframe: false,
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms: this.uniforms
        })
    
        // Customize color
        this.material.uniforms.uColor.value = new THREE.Color('#2e2e2d')
    }

    setMesh()
    {
        super.setMesh()

        this.mesh.position.y -= 0.05
    }
}