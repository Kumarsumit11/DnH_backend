"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_BUCKETS = exports.Bucket = void 0;
var Bucket;
(function (Bucket) {
    Bucket["COMPANY_DOCUMENTS"] = "company-documents";
    Bucket["INVESTOR_DOCUMENTS"] = "investor-documents";
    Bucket["AVATARS"] = "avatars";
    Bucket["LOGOS"] = "logos";
    Bucket["KYC"] = "kyc";
    Bucket["PITCH_DECKS"] = "pitch-decks";
})(Bucket || (exports.Bucket = Bucket = {}));
exports.ALL_BUCKETS = Object.values(Bucket);
