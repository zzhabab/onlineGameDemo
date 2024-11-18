uniform sampler2D tBackground;

varying vec2 vUv;

void main()
{
    vec4 backgroundColor = texture2D(tBackground, vUv);

    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
