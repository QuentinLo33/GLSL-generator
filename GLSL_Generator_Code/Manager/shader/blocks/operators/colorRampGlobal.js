export function colorRampGlobalCode(maxInstances = 4, maxStops = 8) {
    return `
#define MAX_INSTANCES ${maxInstances}
#define MAX_STOPS     ${maxStops}
#define TOTAL_STOPS   ${maxInstances * maxStops}

uniform int   ramp_count[MAX_INSTANCES];
uniform int   ramp_mode[MAX_INSTANCES];
uniform float ramp_positions[TOTAL_STOPS];
uniform vec3  ramp_colors[TOTAL_STOPS];

vec3 colorRamp(float inputVal, int id) {
    int offset = id * MAX_STOPS;
    int count  = ramp_count[id];
    int mode   = ramp_mode[id];
    vec3 result = ramp_colors[offset];

    for (int i = 0; i < MAX_STOPS - 1; i++) {
        if (i >= count - 1) break;
        float p0 = ramp_positions[offset + i];
        float p1 = ramp_positions[offset + i + 1];
        vec3  c0 = ramp_colors[offset + i];
        vec3  c1 = ramp_colors[offset + i + 1];
        if (inputVal >= p0 && inputVal <= p1) {
            if (mode == 0) {
                float t = clamp((inputVal - p0) / (p1 - p0), 0.0, 1.0);
                result = mix(c0, c1, t);
            } else if (mode == 1) {
                result = mix(c0, c1, smoothstep(p0, p1, inputVal));
            } else {
                result = c0;
            }
        }
    }
    return result;
}
`;
}