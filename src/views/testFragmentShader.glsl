varying vec2 vUv;
void main()
{
  // gl_FragColor = vec4(vUv, 1.0, 1.0);
  gl_FragColor = vec4(vUv.x + 0.55, vUv.x + 0.48, vUv.x + 0.06, 1.0);
}
