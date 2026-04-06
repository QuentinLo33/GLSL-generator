export function colorRampGlobalCode(maxInstances = 4, maxStops = 8) {
    return `

// =====================
// COLOR RAMP GLOBAL
// =====================

// Maximum number of color ramp instances supported
#define MAX_INSTANCES ${maxInstances}

// Maximum number of color stops per ramp
#define MAX_STOPS     ${maxStops}

// Total number of stored stops across all instances (flattened array)
#define TOTAL_STOPS   ${maxInstances * maxStops}

// Uniforms storing ramp configuration for all instances
uniform int   ramp_count[MAX_INSTANCES];   // Number of active stops per ramp instance
uniform int   ramp_mode[MAX_INSTANCES];    // Interpolation mode per ramp instance
uniform float ramp_positions[TOTAL_STOPS]; // Flattened positions of all stops
uniform vec3  ramp_colors[TOTAL_STOPS];    // Flattened RGB colors of all stops

// Evaluates a color ramp given an input value and an instance ID
vec3 colorRamp(float inputVal, int id) {

    // Compute offset into flattened arrays for this instance
    int offset = id * MAX_STOPS;

    // Number of active stops for this ramp
    int count  = ramp_count[id];

    // Interpolation mode:
    // 0 = linear
    // 1 = smooth (smoothstep)
    // 2 = constant (step-like)
    int mode   = ramp_mode[id];

    // Default result (fallback to first color)
    vec3 result = ramp_colors[offset];

    // Loop through stop intervals
    for (int i = 0; i < MAX_STOPS - 1; i++) {

        // Prevent reading beyond the number of valid stops
        if (i >= count - 1) break;

        // Current and next stop positions
        float p0 = ramp_positions[offset + i];
        float p1 = ramp_positions[offset + i + 1];

        // Corresponding colors
        vec3  c0 = ramp_colors[offset + i];
        vec3  c1 = ramp_colors[offset + i + 1];

        // Check if input falls within this segment
        if (inputVal >= p0 && inputVal <= p1) {

            // Linear interpolation
            if (mode == 0) {
                float t = clamp((inputVal - p0) / (p1 - p0), 0.0, 1.0);
                result = mix(c0, c1, t);

            // Smooth interpolation using smoothstep
            } else if (mode == 1) {
                result = mix(c0, c1, smoothstep(p0, p1, inputVal));

            // Constant mode: no interpolation, just use left color
            } else {
                result = c0;
            }
        }
    }

    return result;
}
`;
}