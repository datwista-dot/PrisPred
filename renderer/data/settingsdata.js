// =========================================================
// ORDER SUMMARY TEMPLATES
// =========================================================

window.ORDER_TEMPLATES = {

    regular: `Thank you for the purchase. Your order is ready for pick-up.<br><br>
You can find me on Astraeos 5992, my base co-ordinates are 41 / 24. We have a public TP at 74.2 / 20.7 which is basically on the "Korinthos South West" Spawn point - on the South tip of this area of land. TP: Prismatic Predators.<br><br>
{{collectionLine}}<br><br>
**Your order:**<br>{{dinoText}}<br><br>
**Payment: {{currentAmount}} {{paymentType}} {{discountText}}**<br><br>
There is an open transmitter there for your transferring convenience. I do hope you enjoy your new dinos.<br><br>
Feedback is always appreciated - https://discord.com/channels/1414322377969635448/1414680153103142922`,

    booster: `Thank you for the purchase. Your order is ready for pick-up.<br><br>
You can find me on Astraeos 5992, your eggs are in our Beach House located at 74 / 21 which is basically on the "Korinthos South West" Spawn point.<br><br>
{{collectionLine}}<br><br>
**Your order:**<br>{{dinoText}}<br><br>
**Payment: {{currentAmount}} {{paymentType}} {{discountText}}**<br><br>
There is an open transmitter there for your transferring convenience. I do hope you enjoy your new dinos.<br><br>
Feedback is always appreciated - https://discord.com/channels/1414322377969635448/1414680153103142922`,

    auction: `Congratulations on winning the {{headerName}} Adult Pair {{auctionWord}}!<br><br> 
Your dinos are ready for collection.<br><br> 
You can find me on Astraeos 5992, {{locationText}}<br><br> 
{{collectionLine}}<br><br> 
**Auction Details:**<br>{{detailsHTML}}<br>{{totalText}}<br><br> 
**Thank you for supporting the breeders.**`

};


// =========================================================
// PAYMENT TYPES
// =========================================================

window.PAYMENT_TYPES = [

    {
        name: "Tek Ceilings",
        multiplier: 1
    },

    {
        name: "Tek Cloners",
        multiplier: 0.01
    },

    {
        name: "Tek Troughs",
        multiplier: 0.05
    },

    {
        name: "Tek Foundations",
        multiplier: 0.8
    },

    {
        name: "Tek Walls",
        multiplier: 1.2
    },

    {
        name: "Large Tek Walls",
        multiplier: 0.3
    },

    {
        name: "Small Teleporters",
        multiplier: 0.08
    },

    {
        name: "Medium Teleporters",
        multiplier: 0.04
    },

    {
        name: "Large Teleporters",
        multiplier: 0.01
    },

    {
        name: "Tek Generators",
        multiplier: 0.03
    }

];


// =========================================================
// ORDER SUMMARY ADDITIONAL TEXT
// =========================================================

window.ORDER_SUMMARY_TEXT = {

    regular: {

        collection:
            `Collections are done upstairs - Your eggs are in the <b>{{selectedFridgeLabel}}</b> fridge. The pin code for the <b>{{selectedFridgeLabel}}</b> section is {{pin}}. Fridge, dedicated storage and vault.`,

        collectionF2F:
            `Collections are done upstairs - Your eggs are in the <b>{{selectedFridgeLabel}}</b> fridge. Large trades such as these are done Face to Face Trade / Prepaid. The Pin for the <b>{{selectedFridgeLabel}}</b> dedi is {{pin}}. Let me know when you are available and we can sort this out for you.`,

        boosterCollection:
            `Your eggs are in the fridge with your name on it. The permanent pin code for your fridge has already been provided to you. Check pinned messages.`,

        boosterPerk:
            ` (Booster Perk)`,

        extraFemale:
            ` + {{extraFemale}} (+1 Female Egg)`

    },

    auction: {

        regularLocation:
            `my base co-ordinates are 41 / 24. We have a public TP at 74.2 / 20.7 which is basically on the "Korinthos South West" Spawn point - on the South tip of this area of land, you can teleport to Prismatic Predators.`,

        boosterLocation:
            `your dinos are in our Beach House located at 74 / 21 which is basically on the "Korinthos South West" Spawn point - on the South tip of this area of land.`,

        collection:
            `Collections are done upstairs - Your dinos are in the <b>{{selectedFridgeLabel}}</b> fridge. The pin code for the <b>{{selectedFridgeLabel}}</b> section is {{pin}}. Fridge, dedicated storage and vault.`,

        collectionF2F:
            `Collections are done upstairs - Your dinos are in the <b>{{selectedFridgeLabel}}</b> fridge. Large trades such as these are done Face to Face Trade / Prepaid. The Pin for the <b>{{selectedFridgeLabel}}</b> dedi is {{pin}}. Let me know when you are available and we can sort this out for you.`,

        boosterCollection:
            `Your dinos are in the fridge with your name on it. The permanent pin code for your fridge has already been provided to you (Check Pinned Messages).`,

        detail:
            `Dino: {{dinoName}} Adult Pair<br>Winning Bid: {{bid}} Tek Ceilings`,

        emptyDetail:
            `Dino: [Auction Dino Name] Adult Pair<br>Winning Bid: [Winning Tek Amount] Tek Ceilings`,

        total:
            `<br><b>Total Owed: {{totalBid}} Tek Ceilings</b>`

    }

};


// =========================================================
// PREVIEW DATA
// =========================================================

window.PREVIEW_DATA = {

    regular: {

        collectionLine:
            `Collections are done upstairs - Your eggs are in the <b>Green #3</b> fridge. The pin code for the <b>Green #3</b> section is 1234. Fridge, dedicated storage and vault.`,

        dinoText:
            `Example Dino: 250<br>Example Rex: 300`,

        currentAmount:
            "1,000",

        paymentType:
            "Tek Ceilings",

        discountText:
            "10% Discount"

    },

    booster: {

        collectionLine:
            `Your eggs are in the fridge with your name on it. The permanent pin code for your fridge has already been provided to you. Check pinned messages.`,

        dinoText:
            `Example Dino: 0 (Booster Perk)<br>Example Rex: 250`,

        currentAmount:
            "250",

        paymentType:
            "Tek Ceilings",

        discountText:
            "10% Discount"

    },

    auction: {

        headerName:
            "Example Dino",

        auctionWord:
            "auction",

        locationText:
            `my base co-ordinates are 41 / 24. We have a public TP at 74.2 / 20.7 which is basically on the "Korinthos South West" Spawn point - on the South tip of this area of land, you can teleport to Prismatic Predators.`,

        collectionLine:
            `Collections are done upstairs - Your dinos are in the <b>Green #3</b> fridge. Large trades such as these are done Face to Face Trade / Prepaid. The Pin for the <b>Green #3</b> dedi is 1234. Let me know when you are available and we can sort this out for you.`,

        detailsHTML:
            `Dino: Example Dino Adult Pair<br>Winning Bid: 1,000 Tek Ceilings`,

        totalText:
            `<br><b>Total Owed: 1,000 Tek Ceilings</b>`

    }

};

// =========================================================
// REGULAR TABLE DATA
// =========================================================

window.REGULAR_TABLE_DATA = [

    { fridge: "Green #1", name: "", amount: "", mention: true },
    { fridge: "Green #2", name: "", amount: "" },
    { fridge: "Green #3", name: "", amount: "" },
    { fridge: "Green #4", name: "", amount: "" },
    { fridge: "Green #5", name: "", amount: "" },
    { fridge: "Green #6", name: "", amount: "" },
    { fridge: "Green #7", name: "", amount: "" },
    { fridge: "Green #8", name: "", amount: "" },
    { fridge: "Green #9", name: "", amount: "" },
    { fridge: "Green #10", name: "", amount: "" },

    { fridge: "Blue #1", name: "", amount: "" },
    { fridge: "Blue #2", name: "", amount: "" },
    { fridge: "Blue #3", name: "", amount: "" },
    { fridge: "Blue #4", name: "", amount: "" },
    { fridge: "Blue #5", name: "", amount: "" },
    { fridge: "Blue #6", name: "", amount: "" },
    { fridge: "Blue #7", name: "", amount: "" },
    { fridge: "Blue #8", name: "", amount: "" },
    { fridge: "Blue #9", name: "", amount: "" },
    { fridge: "Blue #10", name: "", amount: "" },

    { fridge: "Red #1", name: "", amount: "" },
    { fridge: "Red #2", name: "", amount: "" },
    { fridge: "Red #3", name: "", amount: "" },
    { fridge: "Red #4", name: "", amount: "" },
    { fridge: "Red #5", name: "", amount: "" },
    { fridge: "Red #6", name: "", amount: "" },
    { fridge: "Red #7", name: "", amount: "" },
    { fridge: "Red #8", name: "", amount: "" },
    { fridge: "Red #9", name: "", amount: "" },
    { fridge: "Red #10", name: "", amount: "" },

    { fridge: "Yellow #1", name: "", amount: "" },
    { fridge: "Yellow #2", name: "", amount: "" },
    { fridge: "Yellow #3", name: "", amount: "" },
    { fridge: "Yellow #4", name: "", amount: "" },
    { fridge: "Yellow #5", name: "", amount: "" },
    { fridge: "Yellow #6", name: "", amount: "" },
    { fridge: "Yellow #7", name: "", amount: "" },
    { fridge: "Yellow #8", name: "", amount: "" },
    { fridge: "Yellow #9", name: "", amount: "" },
    { fridge: "Yellow #10", name: "", amount: "" }

];


// =========================================================
// BOOSTER TABLE DATA
// =========================================================

window.BOOSTER_TABLE_DATA = [

    { name: "kol", amount: "" },
    { name: "Buggalooshrimp1", amount: "" },
    { name: "Toasti", amount: "" },
    { name: "Dizz84$", amount: "" },
    { name: "Jessal", amount: "" },
    { name: "Lina", amount: "" },
    { name: "LongStrangeTrip", amount: "" },
    { name: "Philosoraptor", amount: "" },
    { name: "Taylorkins", amount: "" },
    { name: "Evil Panda", amount: "" },
    { name: "Minutepapillon", amount: "" },
    { name: "boldunicorn92", amount: "" },
    { name: "Ducky", amount: "" },
    { name: "duncton007", amount: "" },
    { name: "Kaulana", amount: "" },
    { name: "SWiFTY🇬🇧", amount: "" },
    { name: "Grumpy Granny", amount: "" },
    { name: "Patch Notes", amount: "" },
    { name: "Katjes", amount: "" },
    { name: "St1tch1999", amount: "" },

    { name: "Chihiro", amount: "" },
    { name: "Pyah", amount: "" },
    { name: "AlberRJ", amount: "" },
    { name: "Kirito", amount: "" },
    { name: "Velithvya", amount: "" },
    { name: "xlocoxlegendx", amount: "" },
    { name: "🎀 Natalie 🎀", amount: "" },
    { name: "Headie", amount: "" },
    { name: "Woods", amount: "" },
    { name: "Short (Froot Loop Crew)", amount: "" },
    { name: "RAULGSXS1000", amount: "" },
    { name: "Elle", amount: "" },
    { name: "SAPHIR_RR_KALASH", amount: "" },
    { name: "BUCK", amount: "" },
    { name: "Tier", amount: "" },
    { name: "LuckyMama05🩷🤍", amount: "" },
    { name: "Yurguen_CR", amount: "" },
    { name: "🌟Cris", amount: "" },
    { name: "Wild-tiger", amount: "" },
    { name: "", amount: "" }

];