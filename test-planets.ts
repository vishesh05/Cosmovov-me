import { MakeTime, Body, GeoVector, Ecliptic } from "astronomy-engine";

const astroTime = MakeTime(new Date("2001-12-01T12:00:00Z"));
console.log("Uranus defined?", Body.Uranus);
const vec = GeoVector(Body.Uranus, astroTime, true);
console.log("Vec:", vec);
const ecl = Ecliptic(vec);
console.log("Ecl:", ecl.elon);
