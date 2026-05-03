try {
    require('./server.js');
} catch (e) {
    console.log("ERROR MESSAGE:", e.message);
    console.log("REQUIRE STACK:");
    e.requireStack.forEach(s => console.log(s));
}
