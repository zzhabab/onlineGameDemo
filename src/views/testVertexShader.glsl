// varying关键字如果在片着色器中也写这么一个相同关键字+类型+变量名那么这个变量就可以传递到片着色器中
varying vec2 vUv;
void main()
{
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = vec4(position, 1.0);
  // 这里的uv并没有定义但是就可以使用，着色器都是以material的形式与geometry结合
  // geometry当然就会带一个uv，这里的uv就是geometry自带的uv
  vUv = uv;
}
