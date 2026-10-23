// wasi-libc has no users; llvh only uses this to find the home directory
#pragma once

#include <stddef.h>
#include <sys/types.h>

struct passwd {
  char *pw_name;
  char *pw_dir;
};

static inline struct passwd *getpwuid(uid_t uid) { (void)uid; return NULL; }
static inline struct passwd *getpwnam(const char *name) { (void)name; return NULL; }
static inline uid_t getuid(void) { return 0; }
static inline uid_t geteuid(void) { return 0; }
