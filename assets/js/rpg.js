// Auto-generated from ErnosPlain — demo game (browser-wrapped by build.sh)
window.ep_random_int = window.ep_random_int || ((lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo);
(function () {
// Auto-generated JavaScript from ErnosPlain

class Player {
    constructor(name = "", hp = 0, max_hp = 0, atk = 0) {
        this.name = name;
        this.hp = hp;
        this.max_hp = max_hp;
        this.atk = atk;
    }
}

class Companion {
    constructor(name = "", hp = 0, max_hp = 0, atk = 0, mp = 0) {
        this.name = name;
        this.hp = hp;
        this.max_hp = max_hp;
        this.atk = atk;
        this.mp = mp;
    }
}

class Monster {
    constructor(name = "", hp = 0, max_hp = 0, atk = 0, species = "") {
        this.name = name;
        this.hp = hp;
        this.max_hp = max_hp;
        this.atk = atk;
        this.species = species;
    }
}

class CombatantObj {
    constructor(_variant, _fields) { this._variant = _variant; this._fields = _fields || []; }
    static PlayerType(val) { return new CombatantObj("PlayerType", [val]); }
    static CompanionType(val) { return new CombatantObj("CompanionType", [val]); }
    static MonsterType(val) { return new CombatantObj("MonsterType", [val]); }
}
const PlayerType = CombatantObj.PlayerType;
const CompanionType = CombatantObj.CompanionType;
const MonsterType = CombatantObj.MonsterType;

CombatantObj.prototype.get_name = function() {
    const self = this;
    switch (self._variant) {
        case "PlayerType": {
            const p = self._fields[0];
            return p.get_name();
            break;
        }
        case "CompanionType": {
            const c = self._fields[0];
            return c.get_name();
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return m.get_name();
            break;
        }
    }
    return "";
};

CombatantObj.prototype.get_hp = function() {
    const self = this;
    switch (self._variant) {
        case "PlayerType": {
            const p = self._fields[0];
            return p.get_hp();
            break;
        }
        case "CompanionType": {
            const c = self._fields[0];
            return c.get_hp();
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return m.get_hp();
            break;
        }
    }
    return 0;
};

CombatantObj.prototype.get_max_hp = function() {
    const self = this;
    switch (self._variant) {
        case "PlayerType": {
            const p = self._fields[0];
            return p.get_max_hp();
            break;
        }
        case "CompanionType": {
            const c = self._fields[0];
            return c.get_max_hp();
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return m.get_max_hp();
            break;
        }
    }
    return 0;
};

CombatantObj.prototype.take_damage = function(damage) {
    const self = this;
    switch (self._variant) {
        case "PlayerType": {
            const p = self._fields[0];
            return p.take_damage(damage);
            break;
        }
        case "CompanionType": {
            const c = self._fields[0];
            return c.take_damage(damage);
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return m.take_damage(damage);
            break;
        }
    }
    return 0;
};

CombatantObj.prototype.heal = function(amount) {
    const self = this;
    switch (self._variant) {
        case "PlayerType": {
            const p = self._fields[0];
            return p.heal(amount);
            break;
        }
        case "CompanionType": {
            const c = self._fields[0];
            return c.heal(amount);
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return m.heal(amount);
            break;
        }
    }
    return 0;
};

CombatantObj.prototype.attack_target = function(target) {
    const self = this;
    switch (self._variant) {
        case "PlayerType": {
            const p = self._fields[0];
            return p.attack_target(target);
            break;
        }
        case "CompanionType": {
            const c = self._fields[0];
            return c.attack_target(target);
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return m.attack_target(target);
            break;
        }
    }
    return 0;
};

CombatantObj.prototype.is_alive = function() {
    const self = this;
    switch (self._variant) {
        case "PlayerType": {
            const p = self._fields[0];
            return p.is_alive();
            break;
        }
        case "CompanionType": {
            const c = self._fields[0];
            return c.is_alive();
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return m.is_alive();
            break;
        }
    }
    return false;
};

Companion.prototype.cast_mend = function(target) {
    const self = this;
    let r;
    if ((self.mp >= 10)) {
        self.mp = (self.mp - 10);
        console.log((((("❇️  " + String(self.name)) + " casts Mend on ") + String(target.get_name())) + "!"));
        r = target.heal(30);
        console.log(((((("    " + String(target.get_name())) + " is healed. HP: ") + String(target.get_hp())) + "/") + String(target.get_max_hp())));
    } else {
        console.log((("⚠️  " + String(self.name)) + " tried to cast Mend, but has out of MP!"));
    }
    return 0;
};

CombatantObj.prototype.try_companion_heal = function(target) {
    const self = this;
    let r;
    switch (self._variant) {
        case "CompanionType": {
            const c = self._fields[0];
            r = c.cast_mend(target);
            return 1;
            break;
        }
        case "PlayerType": {
            const p = self._fields[0];
            return 0;
            break;
        }
        case "MonsterType": {
            const m = self._fields[0];
            return 0;
            break;
        }
    }
    return 0;
};

Player.prototype.get_name = function() {
    const self = this;
    return self.name;
};
Player.prototype.get_hp = function() {
    const self = this;
    return self.hp;
};
Player.prototype.get_max_hp = function() {
    const self = this;
    return self.max_hp;
};
Player.prototype.take_damage = function(damage) {
    const self = this;
    self.hp = (self.hp - damage);
    if ((self.hp < 0)) {
        self.hp = 0;
    }
    return self.hp;
};
Player.prototype.heal = function(amount) {
    const self = this;
    self.hp = (self.hp + amount);
    if ((self.hp > self.max_hp)) {
        self.hp = self.max_hp;
    }
    return self.hp;
};
Player.prototype.attack_target = function(target) {
    const self = this;
    let new_hp, dmg, roll;
    roll = ep_random_int(1, 100);
    dmg = self.atk;
    if ((roll > 80)) {
        dmg = (self.atk * 2);
        console.log((((((("⚔️  CRITICAL HIT! " + String(self.name)) + " strikes ") + String(target.get_name())) + " for ") + String(dmg)) + " damage!"));
    } else {
        console.log((((((("⚔️  " + String(self.name)) + " attacks ") + String(target.get_name())) + " for ") + String(dmg)) + " damage!"));
    }
    new_hp = target.take_damage(dmg);
    return new_hp;
};
Player.prototype.is_alive = function() {
    const self = this;
    return (self.hp > 0);
};

Companion.prototype.get_name = function() {
    const self = this;
    return self.name;
};
Companion.prototype.get_hp = function() {
    const self = this;
    return self.hp;
};
Companion.prototype.get_max_hp = function() {
    const self = this;
    return self.max_hp;
};
Companion.prototype.take_damage = function(damage) {
    const self = this;
    self.hp = (self.hp - damage);
    if ((self.hp < 0)) {
        self.hp = 0;
    }
    return self.hp;
};
Companion.prototype.heal = function(amount) {
    const self = this;
    self.hp = (self.hp + amount);
    if ((self.hp > self.max_hp)) {
        self.hp = self.max_hp;
    }
    return self.hp;
};
Companion.prototype.attack_target = function(target) {
    const self = this;
    let dmg, new_hp;
    dmg = self.atk;
    console.log((((((("🪄  " + String(self.name)) + " shoots a magic bolt at ") + String(target.get_name())) + " for ") + String(dmg)) + " damage!"));
    new_hp = target.take_damage(dmg);
    return new_hp;
};
Companion.prototype.is_alive = function() {
    const self = this;
    return (self.hp > 0);
};

Monster.prototype.get_name = function() {
    const self = this;
    return self.name;
};
Monster.prototype.get_hp = function() {
    const self = this;
    return self.hp;
};
Monster.prototype.get_max_hp = function() {
    const self = this;
    return self.max_hp;
};
Monster.prototype.take_damage = function(damage) {
    const self = this;
    self.hp = (self.hp - damage);
    if ((self.hp < 0)) {
        self.hp = 0;
    }
    return self.hp;
};
Monster.prototype.heal = function(amount) {
    const self = this;
    self.hp = (self.hp + amount);
    if ((self.hp > self.max_hp)) {
        self.hp = self.max_hp;
    }
    return self.hp;
};
Monster.prototype.attack_target = function(target) {
    const self = this;
    let new_hp, dmg;
    dmg = (self.atk + ep_random_int((0 - 2), 2));
    console.log((((((((("👹  [" + String(self.species)) + "] ") + String(self.name)) + " claws ") + String(target.get_name())) + " for ") + String(dmg)) + " damage!"));
    new_hp = target.take_damage(dmg);
    return new_hp;
};
Monster.prototype.is_alive = function() {
    const self = this;
    return (self.hp > 0);
};

function count_alive(team) {
    let count, len, member, i;
    count = 0;
    len = team.length;
    i = 0;
    while ((i < len)) {
        member = team[i];
        if (member.is_alive()) {
            count = (count + 1);
        }
        i = (i + 1);
    }
    return count;
}

function get_first_alive(team) {
    let len, member, fallback, i;
    len = team.length;
    i = 0;
    while ((i < len)) {
        member = team[i];
        if (member.is_alive()) {
            return member;
        }
        i = (i + 1);
    }
    fallback = team[0];
    return fallback;
}

function display_team_status(team_name, team) {
    let i, member, len;
    console.log((("--- " + String(team_name)) + " Status ---"));
    len = team.length;
    i = 0;
    while ((i < len)) {
        member = team[i];
        if (member.is_alive()) {
            console.log((((((("  🟢 " + String(member.get_name())) + ": ") + String(member.get_hp())) + "/") + String(member.get_max_hp())) + " HP"));
        } else {
            console.log((("  💀 " + String(member.get_name())) + ": DEAD"));
        }
        i = (i + 1);
    }
    return 0;
}

function main() {
    let member, party, healer_struct, party_idx, i, enemy, round, healer, enemies, hero_ref, ok, r, enemy_len, goblin_struct, orc_struct, goblin, target, hero, hero_struct, orc, party_len;
    console.log("=============================================");
    console.log("⚔️  WELCOME TO THE ERNOSPLAIN RPG ENTIRETY ⚔️");
    console.log("=============================================");
    hero_struct = new Player("Alric the Bold", 120, 120, 30);
    healer_struct = new Companion("Lyra the Priestess", 80, 80, 12, 30);
    hero = PlayerType(hero_struct);
    healer = CompanionType(healer_struct);
    party = [];
    ok = party.push(hero);
    ok = party.push(healer);
    goblin_struct = new Monster("Grizzle", 60, 60, 14, "Goblin");
    orc_struct = new Monster("Kargoth", 110, 110, 22, "Orc Berserker");
    goblin = MonsterType(goblin_struct);
    orc = MonsterType(orc_struct);
    enemies = [];
    ok = enemies.push(goblin);
    ok = enemies.push(orc);
    round = 1;
    while (((count_alive(party) > 0) && (count_alive(enemies) > 0))) {
        console.log((("\n⚔️ ── ROUND " + String(round)) + " ── ⚔️"));
        ok = display_team_status("Party", party);
        ok = display_team_status("Enemies", enemies);
        console.log("");
        party_len = party.length;
        party_idx = 0;
        while (((party_idx < party_len) && (count_alive(enemies) > 0))) {
            member = party[party_idx];
            if (member.is_alive()) {
                switch (member._variant) {
                    case "CompanionType": {
                        const c = member._fields[0];
                        hero_ref = party[0];
                        if (((hero_ref.get_hp() < 60) && hero_ref.is_alive())) {
                            r = member.try_companion_heal(hero_ref);
                        } else {
                            target = get_first_alive(enemies);
                            r = member.attack_target(target);
                        }
                        break;
                    }
                    case "PlayerType": {
                        const p = member._fields[0];
                        target = get_first_alive(enemies);
                        r = member.attack_target(target);
                        break;
                    }
                    case "MonsterType": {
                        const m = member._fields[0];
                        target = get_first_alive(enemies);
                        r = member.attack_target(target);
                        break;
                    }
                }
            }
            party_idx = (party_idx + 1);
        }
        enemy_len = enemies.length;
        i = 0;
        while (((i < enemy_len) && (count_alive(party) > 0))) {
            enemy = enemies[i];
            if (enemy.is_alive()) {
                target = get_first_alive(party);
                r = enemy.attack_target(target);
            }
            i = (i + 1);
        }
        round = (round + 1);
    }
    console.log("\n=============================================");
    if ((count_alive(party) > 0)) {
        console.log("🎉 VICTORY! The heroes have defeated the monsters! 🎉");
    } else {
        console.log("💀 DEFEAT! The party has fallen in battle... 💀");
    }
    console.log("=============================================");
    return 0;
}

window.epRpgBattle = main;
})();
