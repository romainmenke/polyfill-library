/* 21.2.5.10 RegExp.prototype [ @@replace ] ( string, replaceValue ) */

/* global CreateMethodProperty, Symbol, Type, ToString, IsCallable, Get, ToBoolean, Set */
CreateMethodProperty(RegExp.prototype, Symbol.replace, function (string, replaceValue) {
	// 1. Let rx be the this value.
	var rx = this;
	// 2. If Type(rx) is not Object, throw a TypeError exception.
	if (Type(rx) !== 'object') {
		throw new TypeError('not an object');
	}
	// 3. Let S be ? ToString(string).
	var S = ToString(string);
	// 4. Let lengthS be the number of code unit elements in S.
	var lengthS = S.length; // WARNING : not sure here
	// 5. Let functionalReplace be IsCallable(replaceValue).
	var functionalReplace = IsCallable(replaceValue);
	// 6. If functionalReplace is false, then
	if (functionalReplace === false) {
		// 6.a. Set replaceValue to ? ToString(replaceValue).
		replaceValue = ToString(replaceValue);
	}
	
	// 7. Let global be ! ToBoolean(? Get(rx, "global")).
	var global = ToBoolean(Get(rx, "global"));
	console.log('global', global, rx.global);
	// 8. If global is true, then
	var fullUnicode;
	var lastIndex;
	if (global) {
		// 8.a. Let fullUnicode be ! ToBoolean(? Get(rx, "unicode")).
		fullUnicode = ToBoolean(Get(rx, "unicode"));
		// 8.b. Perform ? Set(rx, "lastIndex", +0𝔽, true).
		lastIndex = 0;
	}
	
	// 9. Let results be a new empty List.
	var results = [];
	// 10. Let done be false.
	var done = false;
	// 11. Repeat, while done is false,
	while (done === false) {
		// 11.a. Let result be ? RegExpExec(rx, S).
		var result = RegExp.prototype.exec.call(rx, S);
		// 11.b. If result is null, set done to true.
		if (result === null) {
			done = true;
		} else { // 11.c. Else,
			// 11.c.i. Append result to the end of results.
			results.push(result);
			// 11.c.ii. If global is false, set done to true.
			if (global === false) {
				done = true;
			} else { // 11.c.iii. Else,
				// 11.c.iii.1. Let matchStr be ? ToString(? Get(result, "0")).
				var matchStr = ToString(Get(result, "0"));
				// 11.c.iii.2. If matchStr is the empty String, then
				if (matchStr === "") {
					// 11.c.iii.2.a. Let thisIndex be ℝ(? ToLength(? Get(rx, "lastIndex"))).
					// 11.c.iii.2.b. Let nextIndex be AdvanceStringIndex(S, thisIndex, fullUnicode).
					// 11.c.iii.2.c. Perform ? Set(rx, "lastIndex", 𝔽(nextIndex), true).
				}
			}
		}


	// 12. Let accumulatedResult be the empty String.
	// Let nextSourcePosition be 0.
	// For each element result of results, do
	// Let resultLength be ? LengthOfArrayLike(result).
	// Let nCaptures be max(resultLength - 1, 0).
	// Let matched be ? ToString(? Get(result, "0")).
	// Let matchLength be the number of code units in matched.
	// Let position be ? ToIntegerOrInfinity(? Get(result, "index")).
	// Set position to the result of clamping position between 0 and lengthS.
	// Let n be 1.
	// Let captures be a new empty List.
	// Repeat, while n ≤ nCaptures,
	// Let capN be ? Get(result, ! ToString(𝔽(n))).
	// If capN is not undefined, then
	// Set capN to ? ToString(capN).
	// Append capN as the last element of captures.
	// Set n to n + 1.
	// Let namedCaptures be ? Get(result, "groups").
	// If functionalReplace is true, then
	// Let replacerArgs be « matched ».
	// Append in List order the elements of captures to the end of the List replacerArgs.
	// Append 𝔽(position) and S to replacerArgs.
	// If namedCaptures is not undefined, then
	// Append namedCaptures as the last element of replacerArgs.
	// Let replValue be ? Call(replaceValue, undefined, replacerArgs).
	// Let replacement be ? ToString(replValue).
	// Else,
	// If namedCaptures is not undefined, then
	// Set namedCaptures to ? ToObject(namedCaptures).
	// Let replacement be ? GetSubstitution(matched, S, position, captures, namedCaptures, replaceValue).
	// If position ≥ nextSourcePosition, then
	// NOTE: position should not normally move backwards. If it does, it is an indication of an ill-behaving RegExp subclass or use of an access triggered side-effect to change the global flag or other characteristics of rx. In such cases, the corresponding substitution is ignored.
	// Set accumulatedResult to the string-concatenation of accumulatedResult, the substring of S from nextSourcePosition to position, and replacement.
	// Set nextSourcePosition to position + matchLength.
	// If nextSourcePosition ≥ lengthS, return accumulatedResult.
	// Return the string-concatenation of accumulatedResult and the substring of S from nextSourcePosition.
	// The value of the "name" property of this function is "[Symbol.replace]".
});
