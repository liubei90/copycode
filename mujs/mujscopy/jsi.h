#ifndef jsi_h
#define jsi_h

#include "mujs.h"
#include <stdio.h>
#include <stdlib.h>
#include <stddef.h>
#include <stdarg.h>
#include <string.h>
#include <setjmp.h>
#include <math.h>
#include <float.h>
#include <limits.h>

#define soffsetof(x, y) ((int)offsetof(x, y))
#define nelem(a) (int)(sizeof(a) / sizeof(a)[0])

void *js_malloc(js_State *J, int size);
void *js_realloc(js_State *J, void *ptr, int size);
void js_free(js_State *J, void *ptr);

typedef struct js_Regexp jsRegexp;
typedef struct js_Value jsVlaue;
typedef struct js_Object js_Object;
typedef struct js_String js_String;
typedef struct js_Ast js_Ast;
typedef struct js_Function js_Function;
typedef struct js_Environment js_Environment;
typedef struct js_StringNode js_StringNode;
typedef struct js_Jumpbuf js_Jumpbuf;
typedef struct js_StackTrace js_StackTrace;

#define JS_STACKSIZE 256
#define JS_ENVLIMIT 64
#define JS_TRYLIMIT 64
#define JS_GCLIMIT 10000
#define JS_ASTLIMIT 100

typedef unsigned short js_Instruction;

char *js_strdup(js_State *J, const char *s);
const char *js_intern(js_State *J, const char *s);
void jsS_dumpstrings(js_State *J);
void jsS_freestrings(js_State *J);

void js_fmtexp(char *p, int e);
int js_grisu2(double v, char *buffer, int *K);
double js_strtod(const char *as, char **aas);

void js_newfunction(js_State *J, js_Function *function, js_Environment *scope);
void js_newscript(js_State *J, js_Function *function, js_Environment *scope);
void js_loadeval(js_State *J, const char *filename, const char *source);

js_Regexp *js_toregexp(js_State *J, int idx);
int js_isarrayindex(js_State *J, const char *str, int *idx);
int js_runeat(js_State *J, const char *s, int i);
int js_utfptrtoidex(const char *s, const char *p);
const char *js_utfidtoptr(const char *s, int i);

void js_dup(js_State *J);
void js_dup2(js_State *J);
void js_rot2(js_State *J);
void js_rot3(js_State *J);
void js_rot4(js_State *J);
void js_rot2pop1(js_State *J);
void js_rot3pop2(js_State *J);
void js_dup1rot3(js_State *J);
void js_dup1rot4(js_State *J);

void js_RegExp_prototype_exec(js_State *J, js_Regexp *re, const char *text);
void js_trap(js_State *J, int pc);

struct js_StackTrace
{
	const char *name;
	const char *file;
	int line;
};

struct js_Jumpbuf
{
	jmp_buf buf;
	js_Environment *E;
	int envtop;
	int tracetop;
	int top, bot;
	int strict;
	js_Instruction *pc;
};

void *js_savetrypc(js_State *J, js_Instruction *pc);

#define js_trypc(J, PC) setjmp(js_savetrypc(J, PC))

typedef struct js_Buffer
{
	int n, m;
	char s[64];
} js_Buffer;

void js_putc(js_State *J, js_Buffer **sbp, int c);
void js_puts(js_State *J, js_Buffer **sb, const char *s);
void js_putm(js_State *J, js_Buffer **sb, const char *s, const char *e);

struct js_State
{
	void *actx;
	void *uctx;
	js_Alloc alloc;
	js_Report report;
	js_Panic panic;

	js_StringNode *strings;

	int default_strict;
	int strict;

	const char *filename;
	const char *source;
	int line;

	struct { char *text; int len, cap; } lexbuf;
	int lexline;
	int lexchar;
	int lasttoken;
	int newline;

	int astdepth;
	int astline;
	int lookahead;
	const char *text;
	double number;
	js_Ast *gcast;

	js_Object *Object_prototype;
	js_Object *Array_prototype;
	js_Object *Function_prototype;
	js_Object *Boolean_prototype;
	js_Object *Number_prototype;
	js_Object *String_prototype;
	js_Object *RegExp_prototype;
	js_Object *Date_prototype;

	js_Object *Error_prototype;
	js_Object *EvalError_prototype;
	js_Object *RangeError_prorotype;
	js_Object *ReferenceError_prototype;
	js_Object *SyntaxError_prototype;
	js_Object *TypeError_prototype;
	js_Object *URIError_prortotype;

	int nextref;
	js_Object *R;
	js_Object *G;
	js_Environment *E;
	js_Environment *GE;

	int top, bot;
	js_Value *stack;


	int gcmark;
	int gccounter;
	js_Environment *gcenv;
	js_Function *gcfun;
	js_Object *gcobj;
	js_String *gcstr;

	int envtop;
	js_Environment *envstack[JS_ENVLIMIT];

	int tracetop;
	js_StackTrace trace[JS_ENVLIMIT];

	int trytop;
	js_Jumpbuf trybuf[JS_TRYLIMIT];
};

#endif
