(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Eval = require('./lib/eval')

module.exports = function(ctx, cond){
	
	var eval = new Eval(ctx);
	
	return eval.evaluate(cond);
}
},{"./lib/eval":2}],2:[function(require,module,exports){
var op = require('./op')
	, boolOps = [op.NOT, op.XOR, op.AND, op.OR]
	, helper = require('./helper')
;

module.exports = function(ctx){
	
	var self = this;

	function evalArray(cond){
		boolOps.forEach(function(op){
			cond = helper.reduceArray(cond, op, self);
		})
		
		return evalSingle(cond[0]);		
	}

	function evalSingle(cond){
		if(cond.value !== undefined) return cond.value;

		if(cond.conditions && cond.conditions.constructor === Array)
			return evalArray(cond.conditions);
		
		var l = helper.getFromCtx(cond.leftOperand, ctx) || cond.leftOperand;
		var r = helper.getFromCtx(cond.rightOperand, ctx) || cond.rightOperand;

		var op = helper.getComparator(cond.comparison);

		return op.eval(l,r, self);
	}

	self.evaluate = function(cond){
		if(cond.value !== undefined) return cond.value;
		
		return typeof cond  == "object"
				? evalSingle(cond)
				: cond;
	}
}
},{"./helper":3,"./op":4}],3:[function(require,module,exports){
var op = require('./op')
	, compOps = [op.GT, op.GTE, op.LT, op.LTE, op.EQ, op.NEQ, op.CONTAINS]
;

module.exports.reduceArray = function(conditions, op, evaluator){

	var output = [];

	var carry;
	
	for(var i=conditions.length-1; i>=0; i--){
		
		if(!carry) carry = conditions[i];
		
		var l = (i > 0) ? conditions[i-1] : null;
		
		if(!l || !op.match(carry.bool)){
			output.push(carry);
			carry = null;
		}else{
			carry = {
				bool: l.bool,
				value: op.eval(l, carry, evaluator)
			}
		}
	}

	return output.reverse();
}

module.exports.getFromCtx = function(field, ctx){
	
	var fields = field.split('.');

	fields.forEach(function(f){
		ctx = ctx[f];
	})

	return ctx;
}

module.exports.getComparator = function(op){
	for(var i=0; i < compOps.length; i++){
		var comp = compOps[i];

		if(comp.match(op)) return comp;
	}
}
},{"./op":4}],4:[function(require,module,exports){

module.exports.GT = {
	match : function(op){ return op.toUpperCase() == 'GT' || op == '>'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) > evaluator.evaluate(r);
	}
}

module.exports.GTE = {
	match : function(op){ return op.toUpperCase() == 'GTE' || op == '>='; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) >= evaluator.evaluate(r);
	}
}

module.exports.LT = {
	match : function(op){ return op.toUpperCase() == 'LT' || op == '<'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) < evaluator.evaluate(r);
	}
}

module.exports.LTE = {
	match : function(op){ return op.toUpperCase() == 'LTE' || op == '<='; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) <= evaluator.evaluate(r);
	}
}

module.exports.EQ = {
	match : function(op){ return op.toUpperCase() == 'EQ' || op == '=' || op == '=='|| op == '==='; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) == evaluator.evaluate(r);
	}
}

module.exports.NEQ = {
	match : function(op){ return op.toUpperCase() == 'NEQ' || op == '!=' || op == '!=='|| op == '<>'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) != evaluator.evaluate(r);
	}
}

module.exports.NOT = {
	match : function(op){ return op.toUpperCase() == 'NOT' || op == '!'; },
	eval: function(n, evaluator) {
		return !evaluator.evaluate(n);
	}
}

module.exports.XOR = {
	match : function(op){ return op.toUpperCase() == 'XOR' || op == '^'; },
	eval: function(l, r, evaluator) {
		return !!(evaluator.evaluate(l) ^ evaluator.evaluate(r));
	}
}

module.exports.AND = {
	match : function(op){ return op.toUpperCase() == 'AND' || op == '&&'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) && evaluator.evaluate(r);
	}
}

module.exports.OR = {
	match : function(op){ return op.toUpperCase() == 'OR' || op == '||'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) || evaluator.evaluate(r);
	}
}

module.exports.CONTAINS = {
	match: function(op){ return op.toUpperCase() == 'CONTAINS' || op == '[]'; },
	eval: function(l, r, evaluator){
        return evaluator.evaluate(l).indexOf(evaluator.evaluate(r)) > -1;
	}
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbGliL2V2YWwuanMiLCJzcmMvbGliL2hlbHBlci5qcyIsInNyYy9saWIvb3AuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBFdmFsID0gcmVxdWlyZSgnLi9saWIvZXZhbCcpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0eCwgY29uZCl7XHJcblx0XHJcblx0dmFyIGV2YWwgPSBuZXcgRXZhbChjdHgpO1xyXG5cdFxyXG5cdHJldHVybiBldmFsLmV2YWx1YXRlKGNvbmQpO1xyXG59IiwidmFyIG9wID0gcmVxdWlyZSgnLi9vcCcpXHJcblx0LCBib29sT3BzID0gW29wLk5PVCwgb3AuWE9SLCBvcC5BTkQsIG9wLk9SXVxyXG5cdCwgaGVscGVyID0gcmVxdWlyZSgnLi9oZWxwZXInKVxyXG47XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0eCl7XHJcblx0XHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHRmdW5jdGlvbiBldmFsQXJyYXkoY29uZCl7XHJcblx0XHRib29sT3BzLmZvckVhY2goZnVuY3Rpb24ob3Ape1xyXG5cdFx0XHRjb25kID0gaGVscGVyLnJlZHVjZUFycmF5KGNvbmQsIG9wLCBzZWxmKTtcclxuXHRcdH0pXHJcblx0XHRcclxuXHRcdHJldHVybiBldmFsU2luZ2xlKGNvbmRbMF0pO1x0XHRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGV2YWxTaW5nbGUoY29uZCl7XHJcblx0XHRpZihjb25kLnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjb25kLnZhbHVlO1xyXG5cclxuXHRcdGlmKGNvbmQuY29uZGl0aW9ucyAmJiBjb25kLmNvbmRpdGlvbnMuY29uc3RydWN0b3IgPT09IEFycmF5KVxyXG5cdFx0XHRyZXR1cm4gZXZhbEFycmF5KGNvbmQuY29uZGl0aW9ucyk7XHJcblx0XHRcclxuXHRcdHZhciBsID0gaGVscGVyLmdldEZyb21DdHgoY29uZC5sZWZ0T3BlcmFuZCwgY3R4KSB8fCBjb25kLmxlZnRPcGVyYW5kO1xyXG5cdFx0dmFyIHIgPSBoZWxwZXIuZ2V0RnJvbUN0eChjb25kLnJpZ2h0T3BlcmFuZCwgY3R4KSB8fCBjb25kLnJpZ2h0T3BlcmFuZDtcclxuXHJcblx0XHR2YXIgb3AgPSBoZWxwZXIuZ2V0Q29tcGFyYXRvcihjb25kLmNvbXBhcmlzb24pO1xyXG5cclxuXHRcdHJldHVybiBvcC5ldmFsKGwsciwgc2VsZik7XHJcblx0fVxyXG5cclxuXHRzZWxmLmV2YWx1YXRlID0gZnVuY3Rpb24oY29uZCl7XHJcblx0XHRpZihjb25kLnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjb25kLnZhbHVlO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdHlwZW9mIGNvbmQgID09IFwib2JqZWN0XCJcclxuXHRcdFx0XHQ/IGV2YWxTaW5nbGUoY29uZClcclxuXHRcdFx0XHQ6IGNvbmQ7XHJcblx0fVxyXG59IiwidmFyIG9wID0gcmVxdWlyZSgnLi9vcCcpXHJcblx0LCBjb21wT3BzID0gW29wLkdULCBvcC5HVEUsIG9wLkxULCBvcC5MVEUsIG9wLkVRLCBvcC5ORVEsIG9wLkNPTlRBSU5TXVxyXG47XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5yZWR1Y2VBcnJheSA9IGZ1bmN0aW9uKGNvbmRpdGlvbnMsIG9wLCBldmFsdWF0b3Ipe1xyXG5cclxuXHR2YXIgb3V0cHV0ID0gW107XHJcblxyXG5cdHZhciBjYXJyeTtcclxuXHRcclxuXHRmb3IodmFyIGk9Y29uZGl0aW9ucy5sZW5ndGgtMTsgaT49MDsgaS0tKXtcclxuXHRcdFxyXG5cdFx0aWYoIWNhcnJ5KSBjYXJyeSA9IGNvbmRpdGlvbnNbaV07XHJcblx0XHRcclxuXHRcdHZhciBsID0gKGkgPiAwKSA/IGNvbmRpdGlvbnNbaS0xXSA6IG51bGw7XHJcblx0XHRcclxuXHRcdGlmKCFsIHx8ICFvcC5tYXRjaChjYXJyeS5ib29sKSl7XHJcblx0XHRcdG91dHB1dC5wdXNoKGNhcnJ5KTtcclxuXHRcdFx0Y2FycnkgPSBudWxsO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGNhcnJ5ID0ge1xyXG5cdFx0XHRcdGJvb2w6IGwuYm9vbCxcclxuXHRcdFx0XHR2YWx1ZTogb3AuZXZhbChsLCBjYXJyeSwgZXZhbHVhdG9yKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb3V0cHV0LnJldmVyc2UoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuZ2V0RnJvbUN0eCA9IGZ1bmN0aW9uKGZpZWxkLCBjdHgpe1xyXG5cdFxyXG5cdHZhciBmaWVsZHMgPSBmaWVsZC5zcGxpdCgnLicpO1xyXG5cclxuXHRmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihmKXtcclxuXHRcdGN0eCA9IGN0eFtmXTtcclxuXHR9KVxyXG5cclxuXHRyZXR1cm4gY3R4O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5nZXRDb21wYXJhdG9yID0gZnVuY3Rpb24ob3Ape1xyXG5cdGZvcih2YXIgaT0wOyBpIDwgY29tcE9wcy5sZW5ndGg7IGkrKyl7XHJcblx0XHR2YXIgY29tcCA9IGNvbXBPcHNbaV07XHJcblxyXG5cdFx0aWYoY29tcC5tYXRjaChvcCkpIHJldHVybiBjb21wO1xyXG5cdH1cclxufSIsIlxyXG5tb2R1bGUuZXhwb3J0cy5HVCA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0dUJyB8fCBvcCA9PSAnPic7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpID4gZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuR1RFID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnR1RFJyB8fCBvcCA9PSAnPj0nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA+PSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5MVCA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0xUJyB8fCBvcCA9PSAnPCc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpIDwgZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuTFRFID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnTFRFJyB8fCBvcCA9PSAnPD0nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA8PSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5FUSA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0VRJyB8fCBvcCA9PSAnPScgfHwgb3AgPT0gJz09J3x8IG9wID09ICc9PT0nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA9PSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5ORVEgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdORVEnIHx8IG9wID09ICchPScgfHwgb3AgPT0gJyE9PSd8fCBvcCA9PSAnPD4nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSAhPSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5OT1QgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdOT1QnIHx8IG9wID09ICchJzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihuLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiAhZXZhbHVhdG9yLmV2YWx1YXRlKG4pO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuWE9SID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnWE9SJyB8fCBvcCA9PSAnXic7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gISEoZXZhbHVhdG9yLmV2YWx1YXRlKGwpIF4gZXZhbHVhdG9yLmV2YWx1YXRlKHIpKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLkFORCA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0FORCcgfHwgb3AgPT0gJyYmJzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgJiYgZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuT1IgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdPUicgfHwgb3AgPT0gJ3x8JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgfHwgZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuQ09OVEFJTlMgPSB7XHJcblx0bWF0Y2g6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0NPTlRBSU5TJyB8fCBvcCA9PSAnW10nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcil7XHJcbiAgICAgICAgcmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKS5pbmRleE9mKGV2YWx1YXRvci5ldmFsdWF0ZShyKSkgPiAtMTtcclxuXHR9XHJcbn0iXX0=
