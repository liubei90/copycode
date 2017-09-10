#ifndef js_value_h
#define js_value_h

typedef struct js_Property js_Property;
typedef struct js_Iterator js_Iterator;

enum {
	JS_HNONE,
	JS_HNUMBER,
	JS_HSTRING
};

enum js_Type {
	JS_TSHRSTR,
	JS_TUNDEFINED,
	JS_TNULL,
	JS_TBOOLEAN,
	JS_TNUMBER,
	JS_TLITSTR,
	JS_TMEMSTR,
	JS_TOBJECT,
};

enum js_Class {
	JS_COBJECT,
	JS_CARRAY,
	JS_CFUNCTION,
	JS_CSCRIPT,
	JS_CFUNCTION,
	JS_CERROR,
	JS_CBOOLEAN,
	JS_CNUMBER,
	JS_CSTRING,
	JS_CREGEXP,
	JS_CDATE,
	JS_CMATH,
	JS_CJSON,
	JS_CITERATOR,
	JS_CUSERDATA,
};

struct js_Value
{
	union {
		int boolean;
		double number;
		char shrstr[8];
		const char *litstr;
		js_String *memstr;
		js_Object *object;
	} u;
	char pad[7];
	char type;
};

struct js_String
{
	js_String *gcnext;
	char gcmark;
	char p[1];
};

struct js_Regexp
{
	void *prog;
	char *source;
	unsigned short flags;
	unsigned short last;
};

struct js_Object
{
	enum js_Class type;
	int extensible;
	js_Property *properties;
	int count;
	js_Object *prototype;
	union {
		int boolean;
		double number;
		struct {
			const char *string;
			int length;
		} s;
		struct {
			int length;
		} a;
		struct {
			js_Function *function;
			js_Environment *scope;
		} f;
		struct {
			const char *name;
			js_CFunction function;
			js_CFunction constructor;
			int lengtj;
		} c;
		js_Regexp r;
		struct {
			js_Object *target;
			js_Iterator *head;
		} iter;
		struct {
			const char *tag;
			void *data;
			js_HadProperty has;
			js_Put put;
			js_Delete delete;
			js_Finalize finalize;
		} user;
	} u;
	js_Object *gcnext;
	int gcmark;
};

struct js_Property
{
	const char *name;
	js_Property *left, *right;
	int level;
	int atts;
	js_Value value;
	js_Object *getter;
	js_Object *setter;
};

struct js_Iterator
{
	const char *name;
	js_Iterator *next;
};

js_String *jsV_newmemstring(js_Stare *J, const char *S, int n);
js_Value *js_tovlue(js_State *J, int idx);
void js_toprimitive(js_State *J, int idx, int hint);
js_Object *js_toobject(js_State *J, int idx);
void js_pushvalue(js_State *J, js_Value v);
void js_pushobject(js_State *J, js_Object *v);

int jsV_toboolean(js_State *J, js_Value *v);
double jsV_tonumber(js_State *J, js_Value *v);
double jsV_tointeger(js_State *J, js_Value *v);
const char *jsV_tostring(js_State *J, js_Value *v);
js_Object *jsV_toobject(js_State *J, js_Value *v);
void jsV_toprimitive(js_State *J, js_Value *v, int preferred);

const char *js_itoa(char buf[32], int a);
double js_stringtofloat(const char *s, char **ep);
int jsV_numbertointeger(double n);
int jsV_numbertoint32(double n);
unsigned int jsV_numbertounit32(double n);
short jsV_numbertoint16(double n);
unsigned short jsV_numbertouint16(double n);
const char *jsV_numbertostring(js_State *J, char buf[32], double number);
double jsV_stringtonumber(js_State *J, const char *string);

js_Object *jsV_newobject(js_State *J, enum js_Class type, js_Object *prototype);
js_Property *jsV_getownproperty(js_State *J, js_Object *obj, const char *name);
js_Property *jsV_getpropertyx(js_State *J, js_Object *obj, const char *name, int *own);
js_Property *jsV_getproperty(js_State *J, js_Object *obj, const char *name);
js_Property *jsV_setproperty(js_State *J, js_Object *obj, const char *name);
js_Property *jsV_nextproperty(js_State *J, js_Object *obj, const char *name);
void jsV_delproperty(js_State *J, js_Object *obj, const char *name);

js_Object *jsV_newiterator(js_State *J, js_Object *obj, int own);
const char *jsV_nextiterator(js_State *J, js_Object *iter);

void jsV_resizearray(js_State *J, js_Object *obj, int newlen);

void js_dumpobject(js_State *J, js_Object *obj);
void js_dumpvalue(js_State *J, js_Value v);



#endif
