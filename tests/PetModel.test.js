import { describe, it, expect, beforeEach, vi } from "vitest";
import { PetModel } from "../js/models/PetModel.js";

function makeTask(category, difficulty, isCompleted = true) {
    return { category, difficulty, isCompleted };
}

describe("PetModel", () => {
    describe("constructor", () => {
        it("uses default values when no saved data is provided", () => {
            const pet = new PetModel({});
            expect(pet.energy).toBe(100);
            expect(pet.points).toBe(0);
            expect(pet.happiness).toBe(0);
            expect(pet.wellness).toBe(0);
            expect(pet.friendship).toBe(0);
            expect(pet.expertise).toBe(0);
            expect(pet.diligence).toBe(0);
        });

        it("restores saved values", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({ energy: 50, points: 200, lastLogin: today });
            expect(pet.energy).toBe(50);
            expect(pet.points).toBe(200);
        });

        it("initialises shapeStats and textureStats to zero by default", () => {
            const pet = new PetModel({});
            Object.values(pet.shapeStats).forEach(v => expect(v).toBe(0));
            Object.values(pet.textureStats).forEach(v => expect(v).toBe(0));
        });

        it("sets currentEvolution to unformed_mochi egg by default", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({ lastLogin: today });
            expect(pet.currentEvolution).toEqual({ type: "unformed_mochi", variant: "egg" });
        });

        it("restores saved currentEvolution", () => {
            const today = new Date().toDateString();
            const savedEvolution = { type: "dango", variant: "base" };
            const pet = new PetModel({ lastLogin: today, currentEvolution: savedEvolution });
            expect(pet.currentEvolution).toEqual(savedEvolution);
        });
    });

    describe("addEnergy", () => {
        it("increases energy by the given amount", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({ energy: 50, lastLogin: today });
            pet.addEnergy(20);
            expect(pet.energy).toBe(70);
        });

        it("does not exceed 100", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({ energy: 90, lastLogin: today });
            pet.addEnergy(20);
            expect(pet.energy).toBe(100);
        });
    });

    describe("processTask", () => {
        let pet;

        beforeEach(() => {
            const today = new Date().toDateString();
            pet = new PetModel({ lastLogin: today, dailyCraving: "None" });
        });

        it("does nothing when task is not completed", () => {
            const before = pet.energy;
            pet.processTask(makeTask("Study", 3, false));
            expect(pet.energy).toBe(before);
        });

        it("reduces energy for non-Wellness categories", () => {
            pet.processTask(makeTask("Study", 5));
            expect(pet.energy).toBe(95);
        });

        it("restores energy for Wellness tasks", () => {
            const today = new Date().toDateString();
            pet = new PetModel({ energy: 60, lastLogin: today, dailyCraving: "None" });
            pet.processTask(makeTask("Wellness", 5));
            expect(pet.energy).toBe(70);
        });

        it("does not reduce energy below 0", () => {
            const today = new Date().toDateString();
            pet = new PetModel({ energy: 2, lastLogin: today, dailyCraving: "None" });
            pet.processTask(makeTask("Study", 10));
            expect(pet.energy).toBe(0);
        });

        it("awards points for a regular task", () => {
            pet.processTask(makeTask("Study", 3));
            expect(pet.points).toBe(30);
        });

        it("awards double points for Chores tasks", () => {
            pet.processTask(makeTask("Chores", 3));
            expect(pet.points).toBe(60);
        });

        it("doubles points when task matches daily craving", () => {
            const today = new Date().toDateString();
            pet = new PetModel({ lastLogin: today, dailyCraving: "Study" });
            pet.processTask(makeTask("Study", 3));
            expect(pet.points).toBe(60);
        });

        it("increments the correct shape stat", () => {
            pet.processTask(makeTask("Study", 4));
            expect(pet.shapeStats.doughiness).toBe(4);
        });

        it("increments the correct texture stat", () => {
            pet.processTask(makeTask("Study", 4));
            expect(pet.textureStats.subtlety).toBe(4);
        });

        it("does not exceed 100 for shape stats", () => {
            const today = new Date().toDateString();
            pet = new PetModel({ lastLogin: today, dailyCraving: "None", shapeStats: { stickiness: 0, translucency: 0, doughiness: 98, bounciness: 0, powderiness: 0 } });
            pet.processTask(makeTask("Study", 10));
            expect(pet.shapeStats.doughiness).toBe(100);
        });

        it("increments the correct core stat for each category", () => {
            const today = new Date().toDateString();
            const checks = [
                { category: "Social", stat: "friendship" },
                { category: "Hobby", stat: "happiness" },
                { category: "Wellness", stat: "wellness" },
                { category: "Study", stat: "expertise" },
                { category: "Chores", stat: "diligence" },
            ];
            for (const { category, stat } of checks) {
                pet = new PetModel({ lastLogin: today, dailyCraving: "None" });
                pet.processTask(makeTask(category, 3));
                expect(pet[stat]).toBe(3);
            }
        });

        it("does not modify stats for unknown category", () => {
            const before = { ...pet.shapeStats };
            pet.processTask(makeTask("None", 3));
            expect(pet.shapeStats).toEqual(before);
        });
    });

    describe("decayStats", () => {
        it("reduces all shape and texture stats by 2", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({
                lastLogin: today,
                shapeStats: { stickiness: 10, translucency: 5, doughiness: 3, bounciness: 20, powderiness: 8 },
                textureStats: { sweetness: 10, softness: 5, subtlety: 3, squishiness: 20, chewiness: 8 },
            });
            pet.decayStats();
            expect(pet.shapeStats.stickiness).toBe(8);
            expect(pet.shapeStats.doughiness).toBe(1);
            expect(pet.textureStats.sweetness).toBe(8);
            expect(pet.textureStats.subtlety).toBe(1);
        });

        it("does not reduce stats below 0", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({
                lastLogin: today,
                shapeStats: { stickiness: 1, translucency: 0, doughiness: 0, bounciness: 0, powderiness: 0 },
                textureStats: { sweetness: 0, softness: 0, subtlety: 0, squishiness: 0, chewiness: 1 },
            });
            pet.decayStats();
            expect(pet.shapeStats.stickiness).toBe(0);
            expect(pet.shapeStats.translucency).toBe(0);
            expect(pet.textureStats.chewiness).toBe(0);
        });
    });

    describe("checkDailyReset", () => {
        it("resets energy and sets a new craving when lastLogin is a different day", () => {
            const pet = new PetModel({ energy: 40, lastLogin: "Mon Jan 01 2024" });
            expect(pet.energy).toBe(100);
            expect(pet.lastLogin).toBe(new Date().toDateString());
            const validCategories = ["Chores", "Study", "Hobby", "Social", "Wellness"];
            expect(validCategories).toContain(pet.dailyCraving);
        });

        it("does not reset when lastLogin is today", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({ energy: 40, lastLogin: today, dailyCraving: "Study" });
            expect(pet.energy).toBe(40);
            expect(pet.dailyCraving).toBe("Study");
        });
    });

    describe("getEvolution", () => {
        let pet;

        beforeEach(() => {
            const today = new Date().toDateString();
            pet = new PetModel({ lastLogin: today });
        });

        it("returns unformed_mochi egg when all stats are below threshold", () => {
            const result = pet.getEvolution();
            expect(result).toEqual({ type: "unformed_mochi", variant: "egg" });
        });

        it("returns unformed_mochi egg when dominant stat is below 25", () => {
            pet.shapeStats.stickiness = 24;
            const result = pet.getEvolution();
            expect(result).toEqual({ type: "unformed_mochi", variant: "egg" });
        });

        it("returns dango base when stickiness dominates without strong secondary", () => {
            pet.shapeStats.stickiness = 30;
            const result = pet.getEvolution();
            expect(result).toEqual({ type: "dango", variant: "base" });
        });

        it("returns mizushingen base when translucency dominates", () => {
            pet.shapeStats.translucency = 30;
            const result = pet.getEvolution();
            expect(result).toEqual({ type: "mizushingen", variant: "base" });
        });

        it("returns hishimochi base when doughiness dominates", () => {
            pet.shapeStats.doughiness = 30;
            const result = pet.getEvolution();
            expect(result).toEqual({ type: "hishimochi", variant: "base" });
        });

        it("returns sakuramochi base when bounciness dominates", () => {
            pet.shapeStats.bounciness = 30;
            const result = pet.getEvolution();
            expect(result).toEqual({ type: "sakuramochi", variant: "base" });
        });

        it("returns daifuku base when powderiness dominates", () => {
            pet.shapeStats.powderiness = 30;
            const result = pet.getEvolution();
            expect(result).toEqual({ type: "daifuku", variant: "base" });
        });

        it("returns secondary variant when secondary texture meets threshold", () => {
            pet.shapeStats.stickiness = 30;
            pet.textureStats.sweetness = 20;
            pet.textureStats.chewiness = 10;
            const result = pet.getEvolution();
            expect(result.type).toBe("dango");
            expect(result.variant).toBe("chewiness");
        });

        it("does not trigger secondary variant when secondary value is below 10", () => {
            pet.shapeStats.stickiness = 30;
            pet.textureStats.sweetness = 20;
            pet.textureStats.chewiness = 9;
            const result = pet.getEvolution();
            expect(result.variant).toBe("base");
        });

        it("does not trigger secondary variant when secondary is below 40% of native", () => {
            pet.shapeStats.stickiness = 30;
            pet.textureStats.sweetness = 50;
            pet.textureStats.chewiness = 10;
            const result = pet.getEvolution();
            expect(result.variant).toBe("base");
        });

        it("picks the highest non-native texture as secondary variant", () => {
            pet.shapeStats.stickiness = 30;
            pet.textureStats.sweetness = 20;
            pet.textureStats.subtlety = 15;
            pet.textureStats.chewiness = 10;
            const result = pet.getEvolution();
            expect(result.variant).toBe("subtlety");
        });
    });

    describe("checkEvolution", () => {
        it("returns new evolution and updates currentEvolution when evolution changes", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({ lastLogin: today });
            pet.shapeStats.stickiness = 30;
            const result = pet.checkEvolution();
            expect(result).toEqual({ type: "dango", variant: "base" });
            expect(pet.currentEvolution).toEqual({ type: "dango", variant: "base" });
        });

        it("returns null when evolution has not changed", () => {
            const today = new Date().toDateString();
            const pet = new PetModel({ lastLogin: today, currentEvolution: { type: "unformed_mochi", variant: "egg" } });
            const result = pet.checkEvolution();
            expect(result).toBeNull();
        });
    });
});
