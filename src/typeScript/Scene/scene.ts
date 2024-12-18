import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Brick } from '@/typeScript/Scene'
import { mod, temp } from 'three/examples/jsm/nodes/Nodes.js';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';

const counter = useCounterStore()
export class Scene {
  planeMesh: THREE.Mesh
  groundPhysicsMaterial = new CANNON.Material('groundMaterial');
  brickWall: Array<Brick> = Array.from({length: 3}, (_, index) => new Brick())
  constructor() {
    this.planeMesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
    this.init()
    this.createBrickWall()
    this.setPhysics()
  }
  init = () => {
    this.loadMap()
    // this.planeMesh.rotation.x = - Math.PI / 2;
    // this.planeMesh.receiveShadow = true;
    // counter.scene.add( this.planeMesh );
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
    hemiLight.position.set( 0, 50, 0 );
    counter.scene.add( hemiLight );
    const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight.position.set( 20, 20, 0 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    counter.scene.add( dirLight );
    const directionalLightHelper = new THREE.DirectionalLightHelper(dirLight, 5);
    counter.scene.add(directionalLightHelper);
    const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    counter.scene.add(hemisphereLightHelper);
  }
  setPhysics = () => {
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: this.groundPhysicsMaterial
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.planeMesh.userData = groundBody
    counter.physicsWorld.addBody(groundBody)
  }
  private createBrickWall = () => {
    const myBrickModelGroupList: THREE.Group[] = this.brickWall.map(({model}, index) => model)
    const yOffset = Brick.brickSize.y / 2
    this.brickWall[0].brickBody.position.set(Brick.brickSize.x * 3, 0 + yOffset, 0)
    this.brickWall[1].brickBody.position.set(Brick.brickSize.x * 3, Brick.brickSize.y + yOffset, 0)
    this.brickWall[2].brickBody.position.set(Brick.brickSize.x * 3, Brick.brickSize.y / 2 + yOffset, Brick.brickSize.z)
    const tempGroup = new THREE.Group()
    myBrickModelGroupList.forEach(item => {
      tempGroup.add(item)
    })
    // tempGroup.rotation.x = -Math.PI / 2
    // counter.scene.add(tempGroup)
  }
  loadMap = () => {
    const worldScene = counter.resources.data.world.gltf!.scene
    worldScene.traverse((child: any) => {
      if (child.hasOwnProperty('userData')) {
        if (child.type === 'Mesh')
        {
          this.setupMeshProperties(child);
          // this.sky.csm.setupMaterial(child.material);
          if (child.material.name === 'ocean')
          {
            // this.registerUpdatable(new Ocean(child, this));
          }
        }

        if (child.userData.hasOwnProperty('data'))
        {
          if (child.userData.data === 'physics')
          {
            if (child.userData.hasOwnProperty('type')) 
            {
              // Convex doesn't work! Stick to boxes!
              if (child.userData.type === 'box')
              {
                let phys = this.BoxCollider({size: new THREE.Vector3(child.scale.x, child.scale.y, child.scale.z)});
                phys.position.copy(new CANNON.Vec3(child.position.x, child.position.y, child.position.z));
                phys.quaternion.copy(new CANNON.Quaternion(child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w));

                // phys.shapes.forEach((shape) => {
                //   shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
                // });

                counter.physicsWorld.addBody(phys);
              }
              else if (child.userData.type === 'trimesh')
              {
                let phys = this.TrimeshCollider(child, {});
                counter.physicsWorld.addBody(phys);
              }

              child.visible = false;
            }
          }

          if (child.userData.data === 'path')
          {
            // this.paths.push(new Path(child));
          }

          if (child.userData.data === 'scenario')
          {
            // this.scenarios.push(new Scenario(child, this));
          }
        }
      }
    })
    counter.scene.add(worldScene)
  }
  setupMeshProperties(child: any): void
  {
    child.castShadow = true;
    child.receiveShadow = true;

    if (child.material.map !== null)
    {
      let mat = new THREE.MeshPhongMaterial();
      mat.shininess = 0;
      mat.name = child.material.name;
      mat.map = child.material.map;
      mat.map!.anisotropy = 4;
      mat.aoMap = child.material.aoMap;
      mat.transparent = child.material.transparent;
      // mat.map.encoding = THREE.LinearEncoding;
      child.material = mat;
    }
  }
  BoxCollider = (options: any) => {
    let defaults = {
			mass: 0,
			position: new THREE.Vector3(),
			size: new THREE.Vector3(0.3, 0.3, 0.3),
			friction: 0.3
		};
    Object.assign(defaults, options)
    options = defaults

		options.position = new CANNON.Vec3(options.position.x, options.position.y, options.position.z);
		options.size = new CANNON.Vec3(options.size.x, options.size.y, options.size.z);

		let mat = new CANNON.Material('boxMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		let shape = new CANNON.Box(options.size);
		// shape.material = mat;

		// Add phys sphere
		let physBox = new CANNON.Body({
			mass: options.mass,
			position: options.position,
			shape
		});
		
		physBox.material = mat;
    return physBox
  }
  TrimeshCollider(mesh: THREE.Mesh, options: any) {
		let defaults = {
			mass: 0,
			position: mesh.position,
			rotation: mesh.quaternion,
			friction: 0.3
		};
    Object.assign(defaults, options)
    options = defaults

		let mat = new CANNON.Material('triMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

    const scale = {
      x: 1.0,
      y: 1.0,
      z: 1.0
    }
    let physBox = new CANNON.Body({
			mass: options.mass,
			position: options.position,
			quaternion: options.rotation,
		});
    const geometry = mesh.geometry
		const vertices = geometry.attributes.position.array
    const verticesArray: number[] = []
    const facesArray = geometry.index!.array as unknown as number[]
    for (let i = 0; i < vertices.length; i += 3) {
      verticesArray.push(vertices[i] * scale.x, vertices[i+1] * scale.y, vertices[i+2] * scale.z);
    }
    const shape = new CANNON.Trimesh(verticesArray, facesArray);
    physBox.addShape(shape)
		physBox.material = mat;
    return physBox
	}
}