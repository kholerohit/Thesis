// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x22e580affa44644b425ecbd80101545ac63790431b7351fb1b8a21be829f69dc), uint256(0x1bdcc6c7f003ff7b7f2721ff1308b7a15c39cfad18eb07fe2bacfc4ae4e33f8d));
        vk.beta = Pairing.G2Point([uint256(0x142de5058e6dd1d46433292ca3d9ac9b1137d9566b1dfde880c8c75b7715b7cd), uint256(0x119a80e7638d45d15aaff801fc6207cd325a052e5863bab2872126a397186084)], [uint256(0x16fbd1bd01ef49299f008c17c8373aa4e7c49cbded16b753da4b2b9c765a82f8), uint256(0x2b41e6b775c136c4a1b1eb657358e4a6287c4e2f546c608b06fe8463cee557d9)]);
        vk.gamma = Pairing.G2Point([uint256(0x0002f161581e90e7d9215dc71e26c2153446ef3471c9aaa4d87917198af16aad), uint256(0x22eaaa65f9d806b9d13f7b35c4daad3d4bbcc3e318ca9156b691566b30dbd748)], [uint256(0x2f082c67d7d263908d3e66a4c1d45b86cc3754449578295e0626f8a7ab835af8), uint256(0x2f312db7c1dfed66b1606b31ee7630b0e6c092f4c7ad80b2562f54193830e996)]);
        vk.delta = Pairing.G2Point([uint256(0x09ec6172d64289f525f425b44e340b6d952b12fff63b2c0910e9aa2d50a2771b), uint256(0x06e39e61e3dfd275f8c94c0d7782e9ef03304fd29a8a5a6c32ffc37f4f20fe83)], [uint256(0x211078df69c03f3ba5351f7a278831a676c8b4e4fd3938c7eba03b1ec6231a4d), uint256(0x2e0269651bd8ec93fe7ccdc78931b7dcd4d06a4ccda244e1610188c7c784eaa1)]);
        vk.gamma_abc = new Pairing.G1Point[](13);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x2b1875de835ef7d8300afb1157e94b807abbffa41985854e4ff389eb11172fc9), uint256(0x0420cea8ce6d794dd19018d3398a395941789fc07ca5e4433012ea434f40c6b6));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x20ece3e3c072bfb8d22b6be54efd631bce4a2ef621e7ea66343202867cef8621), uint256(0x294ad4f025c8abe7e31f81fec60b40694bff8ae614b56b6178cefee49f069160));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x0e91e66ee270630e4ab6ddb0df02251122fe62b4fd4714feb23cc1b5bbd61efe), uint256(0x2e658f146c367a5e67d1bc759f2f249c061a0be6ef244701d75c0fd73ccb7eb3));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x1359346a69033da8d05a58514feab799fa2b87331caf3f4f1ca71986223688d1), uint256(0x1771014f0099edb58c60040763739d15ae408086c5e1dc9785ccf7dceb16ab9c));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x06be2831530c1946901972cbdd82712c6a8a02b93a3cf9e5c20097d1435bcb1d), uint256(0x0659c20cfa80ad48bb3217c263c2bc5af23ec0b14d5edb5e1b24472f32e1b847));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x09d3beec87f1d481b2fb5fe3d09ab22fed387ff55f3523b972a8c6947c2e4024), uint256(0x08ef1c72e5b20710df3d7e884cb9f58eb6172345d34e1d4c32b19b91f79be4ae));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x0b8a680253fb1d6638df65688ed6b5e19cf539bd6ffcc0bdabb7696beed1d6eb), uint256(0x195f4027338e7769f78fea64077b811ba16477a1c33237d5b1d8e4a6ba544276));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x289f0f21afff0bc4055daa7fd2ee5807a6928fdfd9de3dac7a5b6e2e13ea9093), uint256(0x2132511416d5c2c6fa56e6abc309359c0970d2668669010a0a1c57434a29e514));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x2d14d4f09b2c3e19744d045fd5645280c4c70865015dee54c27d1a82ebbfcfc5), uint256(0x2ea8740bcc1f4ae34b7a8124882dc73f01aed0c9cfb9915e75e75f2738afe6e6));
        vk.gamma_abc[9] = Pairing.G1Point(uint256(0x11f08bc999d8db132a613f6d2049123f252451ccc02013d3c74ed18a0bf90f39), uint256(0x024e8890b6e63ecbc3b919edc263a848f54a4ecf9a872bb30049034bfabe251c));
        vk.gamma_abc[10] = Pairing.G1Point(uint256(0x00e64ab6da607abaad22d2ddd4e19a37f48d74c3822bc5f582eb165e52fa53c2), uint256(0x2710c7f9b59da46b3d4448da541c1b50f0ed3fe56eb5ac44cf24be5b63470f35));
        vk.gamma_abc[11] = Pairing.G1Point(uint256(0x2c687dd21fb1b52344323ea4700bdc6bb4bc292c4ec1076328e28fe0c77d5d6a), uint256(0x056ab750111b1915e4861a9ade36bb504369e759f0143ca6fbec8c2ca8e67eed));
        vk.gamma_abc[12] = Pairing.G1Point(uint256(0x29bf9be548d5c1b63aced6b5428f1748c34ba4162dec8ab398f7e1d839012761), uint256(0x2d977d537abd135d2a9e61c10dcd80860259633e9206c6b3785b196b671ff1de));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[12] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](12);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
