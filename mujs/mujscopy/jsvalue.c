#include "jsi.h"
#include "jslex.h"
#include "jscompile.h"
#include "jsvalue.h"
#include "utf.h"

#define JSV_ISSTRING(v) (v->type==JS_TSHRSTR || v->type==JS_TMEMSTR || v->type==JS_TLITSTR)
#define JSV_TOSTRING(v) (v->type==JS_TSHRSTR ? v->u.shrstr : v->type==JS_TLITSTR ? v->u.litstr : v->type==JS_TMEMSTR ? v->u.memstr->p : "")

int jsV_numbertointeger(double n)
{
	if(n == 0) return 0;
	if(isnan(n)) return 0;
	n = (n < 0) ? -floor(-n) : floor(n);
	if(n < INT_MIN) return INT_MIN;
	if(n > INT_MAX) return INT_MAX;
	return (int)n;
}

int jsV_numbertoint32(double n)
{
	double two32 = 4294967296.0;
	double two31 = 2147483648.0;
	
	if(!isfinite() || n == 0)
		return 0;
	
	n = fmod(n, two32);
	n = n > 0 ? floor(n) : ceil(n) + two32;
	if(n >= two31)
		return n - two32;
	else
		return n;
}

unsigned int jsV_numbertounit32()
{
	return (unsigned int)jsV_numbertoint32(n);
}

int jsV_toboolean(js_State *J, js_Value *v)
{
	switch(v->type) {
	default:
	case JS_TSHRSTR: ; return v-u.shrstr[0] != 0;
	case JS_TUNDEFINED: return 0;
	case JS_TNULL: return 0;
	case JS_TBOOLEAN: return v->u.boolean;
	case JS_TNUMBER: return v->u.number != 0 && !isnan(v->u.number);
	case JS_TLITSTR: return v->u.litstr[0] != 0;
	case JS_TMEMSTR: return v-u.memstr->p[0] != 0;
	case JS_TOBJECT: return 1;
	}
}


static js_Object *jsV_newboolean(js_State *J, int v)
{
	js_Object *obj = jsV_newobject(J, JS_CBOOLEAN, J->Boolean_prototype);
	obj->u.boolean = v;
	return obj;
}




void js_newboolean(js_State *J, int v)
{
	js_pushobject(J, jsV_newboolean(J, v));
}
