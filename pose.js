import * as THREE from 'three';

// \u041e\u0442\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 21 \u0442\u043e\u0447\u043a\u0438 \u043d\u0430 \u043a\u043e\u0441\u0442\u0438 \u0440\u0443\u043a\u0438 \u043f\u043e \u0437\u0430\u0434\u0430\u043d\u043d\u043e\u0439 \u043a\u0430\u0440\u0442\u0435 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0439
// \u0415\u0441\u043b\u0438 point === null, \u043a\u043e\u0441\u0442\u044c \u043f\u0440\u043e\u043f\u0443\u0441\u043a\u0430\u0435\u0442\u0441\u044f (\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440, \u043a\u043e\u0440\u0435\u043d\u044c).
export const handBoneMapping = [
  { name: 'Root_R',                 point: null },
  { name: 'Thumb_Metacarpal_R',     point: 0 },
  { name: 'Thumb_ProximalPhalanx_R',point: 1 },
  { name: 'Thumb_IntermediatePhalanx_R', point: 2 },
  { name: 'Thumb_DistalPhalanx_R',  point: 3 },
  { name: 'Thumb_End_R',            point: 4 },
  { name: 'Index_Metacarpal_R',     point: 0 },
  { name: 'Index_ProximalPhalanx_R',point: 5 },
  { name: 'Index_IntermediatePhalanx_R', point: 6 },
  { name: 'Index_DistalPhalanx_R',  point: 7 },
  { name: 'Index_End_R',            point: 8 },
  { name: 'Middle_Metacarpal_R',    point: 0 },
  { name: 'Middle_ProximalPhalanx_R',point: 9 },
  { name: 'Middle_IntermediatePhalanx_R', point: 10 },
  { name: 'Middle_DistalPhalanx_R', point: 11 },
  { name: 'Middle_End_R',           point: 12 },
  { name: 'Ring_Metacarpal_R',      point: 0 },
  { name: 'Ring_ProximalPhalanx_R', point: 13 },
  { name: 'Ring_IntermediatePhalanx_R', point: 14 },
  { name: 'Ring_DistalPhalanx_R',   point: 15 },
  { name: 'Ring_End_R',             point: 16 },
  { name: 'Pinky_Metacarpal_R',     point: 0 },
  { name: 'Pinky_ProximalPhalanx_R',point: 17 },
  { name: 'Pinky_IntermediatePhalanx_R', point: 18 },
  { name: 'Pinky_DistalPhalanx_R',  point: 19 },
  { name: 'Pinky_End_R',            point: 20 }
];

// \u041f\u043e\u0434\u0433\u043e\u0442\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u043c
// \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e \u043e \u0431\u0438\u043d\u0434-
// \u043f\u043e\u0437\u0435: \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u043c
// \u0438\u0437\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0435 \u043a\u0432\u0430\u0442\u0435\n+// \u0440\u043d\u0438\u043e\u043d\u044b, \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f
// \u0438 \u0434\u043b\u0438\u043d\u044b \u043a\u043e\u0441\u0442\u0435\u0439.
export function prepareSkeleton(skeleton, mapping = handBoneMapping) {
  function findNext(idx) {
    for (let i = idx + 1; i < mapping.length; i++) {
      if (mapping[i].point !== null) return mapping[i];
    }
    return null;
  }

  mapping.forEach((entry, idx) => {
    const { name } = entry;
    const bone = skeleton.getBoneByName(name);
    if (!bone) return;
    const next = findNext(idx);
    const info = {
      bindQuat: bone.quaternion.clone(),
      bindScale: bone.scale.clone(),
      bindDir: new THREE.Vector3(0, 1, 0),
      bindLength: 1,
    };

    if (next) {
      const child = skeleton.getBoneByName(next.name);
      if (child) {
        const bonePos = new THREE.Vector3();
        const childPos = new THREE.Vector3();
        bone.getWorldPosition(bonePos);
        child.getWorldPosition(childPos);
        const dirWorld = childPos.clone().sub(bonePos);
        info.bindLength = dirWorld.length();
        const parentQuat = new THREE.Quaternion();
        bone.parent.getWorldQuaternion(parentQuat);
        const parentInv = parentQuat.clone().invert();
        info.bindDir = dirWorld.clone().applyQuaternion(parentInv).normalize();
      }
    }

    bone.userData.bindInfo = info;
  });
}

/**
 * \u041f\u0440\u0438\u043c\u0435\u043d\u044f\u0435\u0442 \u043f\u043e\u0437\u0443 \u043a \u0441\u043a\u0435\u043b\u0435\u0442\u0443, \u043e\u0441\u043d\u043e\u0432\u044b\u0432\u0430\u044f\u0441\u044c \u043d\u0430 \u043c\u0430\u0441\u0441\u0438\u0432\u0435 \u0442\u043e\u0447\u0435\u043a \u0438 \u043a\u0430\u0440\u0442\u0435 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0439.
 * @param {THREE.Skeleton} skeleton - \u0421\u043a\u0435\u043b\u0435\u0442 \u0438\u0437 SkinnedMesh.
 * @param {Array<THREE.Vector3>} points - \u041c\u0430\u0441\u0441\u0438\u0432 \u0438\u0437 21 THREE.Vector3 \u0442\u043e\u0447\u0435\u043a \u0432 \u043c\u0438\u0440\u043e\u0432\u044b\u0445 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0430\u0445.
 * @param {Array<{name: string, point: number|null}>} mapping - \u041e\u043f\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u043a\u0430\u0440\u0442\u0430 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u044f; \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e handBoneMapping.
 */
export function applyHandPose(skeleton, points, mapping = handBoneMapping) {
  // 1) \u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u043c\u0438\u0440\u043e\u0432\u044b\u0435 \u043c\u0430\u0442\u0440\u0438\u0446\u044b \u0440\u043e\u0434\u0438\u0442\u0435\u043b\u0435\u0439
  skeleton.bones.forEach(bone => {
    if (bone.parent) bone.parent.updateMatrixWorld(true);
  });

  // 2) \u0412\u044b\u0447\u0438\u0441\u043b\u044f\u0435\u043c \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u0437\u0438\u0446\u0438\u0438 \u0434\u043b\u044f \u043a\u0430\u0436\u0434\u043e\u0439 \u043a\u043e\u0441\u0442\u0438
  mapping.forEach(({ name, point }) => {
    if (point === null) return;
    const bone = skeleton.getBoneByName(name);
    if (!bone) return;
    const targetWorldPos = points[point];
    const parentMatrixWorld = bone.parent.matrixWorld;
    const parentInv = new THREE.Matrix4().copy(parentMatrixWorld).invert();
    const localPos = targetWorldPos.clone().applyMatrix4(parentInv);
    bone.position.copy(localPos);
  });

  // 3) \u0412\u044b\u0447\u0438\u0441\u043b\u044f\u0435\u043c \u043e\u0440\u0438\u0435\u043d\u0442\u0430\u0446\u0438\u044e \u043a\u0430\u0436\u0434\u043e\u0439 \u043a\u043e\u0441\u0442\u0438 \u043f\u043e \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044e \u043a \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0439 \u0442\u043e\u0447\u043a\u0435
  function findNext(idx) {
    for (let i = idx + 1; i < mapping.length; i++) {
      if (mapping[i].point !== null) return mapping[i];
    }
    return null;
  }

  mapping.forEach((entry, idx) => {
    const { name, point } = entry;
    if (point === null) return;
    const bone = skeleton.getBoneByName(name);
    if (!bone) return;
    const next = findNext(idx);
    if (!next) return;
    const childPos = points[next.point];
    const thisPos = points[point];
    const info = bone.userData.bindInfo;

    const dirWorld = childPos.clone().sub(thisPos);
    const len = dirWorld.length();
    if (len === 0) return;
    dirWorld.normalize();

    const parentQuat = new THREE.Quaternion();
    bone.parent.getWorldQuaternion(parentQuat);
    const parentInv = parentQuat.clone().invert();
    const dirLocal = dirWorld.clone().applyQuaternion(parentInv);

    const bindDir = info ? info.bindDir : new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(bindDir, dirLocal);
    bone.quaternion.copy(info ? info.bindQuat : new THREE.Quaternion());
    bone.quaternion.multiply(q);

    if (info) {
      const scale = len / info.bindLength;
      bone.scale.set(
        info.bindScale.x * 1,
        info.bindScale.y * scale,
        info.bindScale.z * 1
      );
    }
  });

  // 4) \u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u0441\u043a\u0435\u043b\u0435\u0442
  // skeleton.pose() \u0441\u0431\u0440\u0430\u0441\u044b\u0432\u0430\u0435\u0442 \u043f\u043e\u0437\u0443
  // \u043d\u0430 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u0438\u0437 bind \u043f\u043e\u0437\u044b,
  // \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c
  // update() \u0434\u043b\u044f \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f \u043c\u0430\u0442\u0440\u0438\u0446 \u043a\u043e\u0441\u0442\u0435\u0439
  skeleton.update();
}

