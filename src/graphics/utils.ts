/**
 * Converts RGB color components to a hexadecimal color string.
 * @param {number} red - The red component (0-255).
 * @param {number} green - The green component (0-255).
 * @param {number} blue - The blue component (0-255).
 * @returns {string} The hexadecimal color string.
 */
function rgbToHex(red: number, green: number, blue: number): string {
    const clippedRed = Math.round(Math.min(255, Math.max(0, red)));
    const clippedGreen = Math.round(Math.min(255, Math.max(0, green)));
    const clippedBlue = Math.round(Math.min(255, Math.max(0, blue)));

    const redHex = clippedRed.toString(16).padStart(2, '0');
    const greenHex = clippedGreen.toString(16).padStart(2, '0');
    const blueHex = clippedBlue.toString(16).padStart(2, '0');
    return `#${redHex}${greenHex}${blueHex}`;
}
export class RGBColor {
    red: number;
    green: number;
    blue: number;

    constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    /**
     * Converts the RGB color to a hexadecimal color string.
     * @returns {string} The hexadecimal color string.
     */
    toHex(): string {
        return rgbToHex(this.red, this.green, this.blue);
    }

    /**
     * Interpolates between this color and another color.
     * @param {RGBColor} otherColor - The other color to interpolate with.
     * @param {number} factor - The interpolation factor (0 to 1).
     * @returns {RGBColor} The interpolated color.
     */
    interpolateWith(otherColor: RGBColor, factor: number): string {
        if (factor < 0 || factor > 1) {
            throw new Error("Interpolation factor must be between 0 and 1.");
        }
        const interpolateComponent = (c1: number, c2: number) => {
            return Math.round(c1 + (c2 - c1) * factor);
        };
        return rgbToHex(
            interpolateComponent(this.red, otherColor.red),
            interpolateComponent(this.green, otherColor.green),
            interpolateComponent(this.blue, otherColor.blue)
        );
    }

    /**
     * Adds another RGB color to this one, with a scalar multiplier for the added color.
     * @param {RGBColor} otherColor - The other RGB color to add.
     * @param {number} scalar - The scalar multiplier for the other color's components.
     * @returns {RGBColor} A new RGBColor instance with the added and scaled color values.
     */
    addScaledColor(otherColor: RGBColor, scalar: number) {
        this.red += otherColor.red * scalar
        this.green += otherColor.green * scalar
        this.blue += otherColor.blue * scalar
    }

    getHex(): string {
        return rgbToHex(this.red, this.green, this.blue);
    }

    copy(): RGBColor {
        return new RGBColor(this.red, this.green, this.blue);
    }
}

