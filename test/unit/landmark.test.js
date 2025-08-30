import { generateLandmarks, Landmark } from "../../landmark.js";
import { strict as assert } from "assert";
import { mockRoute, Waypoint } from "../../public/route.js";
import { expect } from "chai";

describe("generateLandmarks", function () {
    it("returns empty array if input is empty", function () {
        const result = generateLandmarks([]);
        assert(Array.isArray(result));
        assert.equal(result.length, 0);
    });
    it("creates a Landmark object when given one input", function () {
        const result = generateLandmarks( mockRoute );
        assert.equal(result.length, 3);
        assert(result[0] instanceof Landmark);
    });
    it("checks that mockRoute is made of Waypoint objects", function () {
        const result = mockRoute;
        assert(result[0] instanceof Waypoint);
    });
    it("checks that mockRoute[0] Eiffel Tower has lat", function () {
        const eiffel = mockRoute[0];
        assert.equal(eiffel.lat, 48.8584);
    });
    it("checks that mockRoute[0] Eiffel Tower has lon", function () {
        const eiffel = mockRoute[0];
        assert.equal(eiffel.lon, 2.2945);
    });
    it("checks that mockRoute[0] Eiffel Tower has time", function () {
        const eiffel = mockRoute[0];
        console.log("   eiffel.time: ", eiffel.time);
        console.log("   eiffel.time.getTime(): ", eiffel.time.getTime());

        expect(eiffel.time).to.be.instanceof(Date);
        expect(isNaN(eiffel.time.getTime())).to.be.false;
    });
})
describe("", function () {
})

// it("creates one Landmark object when given one input", function () {
//     const result = generateLandmarks([{ lat: 48.8584, lon: 2.2945, name: "Eiffel Tower" }]);
//     assert.equal(result.length, 1);
//     assert(result[0] instanceof Landmark);
//     assert.equal(result[0].name, "Eiffel Tower");
// });
