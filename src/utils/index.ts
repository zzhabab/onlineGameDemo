import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
export function getCameraForwardVectorIgnoreY(): THREE.Vector3 {
  const cameraForwardVector = new THREE.Vector3()
  counter.camera.getWorldDirection(cameraForwardVector)
  /* 此处注意cameraForwardVector.normalize()和cameraForwardVector.y = 0的顺序
  试想将它们位置互换会怎么样，如果我的猜想没错应该会导致方向错误 */
  cameraForwardVector.normalize()
  cameraForwardVector.y = 0
  // 再来一次归一化的目是保证速度在规定方向始终一直，也就是在向前等行动中速度是一致的
  cameraForwardVector.normalize()
  return cameraForwardVector
}

export function zzh() {

}