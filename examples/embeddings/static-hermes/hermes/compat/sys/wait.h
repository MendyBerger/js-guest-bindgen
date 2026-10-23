// wasi-libc has no processes, but llvh's Unix.h includes this unconditionally
#pragma once

#include <errno.h>
#include <sys/types.h>

#define WNOHANG 1
#define WEXITSTATUS(s) (((s) & 0xff00) >> 8)
#define WTERMSIG(s) ((s) & 0x7f)
#define WIFEXITED(s) (!WTERMSIG(s))
#define WIFSIGNALED(s) (((s) & 0xffff) - 1U < 0xffu)

static inline pid_t wait(int *status) { (void)status; errno = ECHILD; return -1; }
static inline pid_t waitpid(pid_t pid, int *status, int options) {
  (void)pid, (void)status, (void)options;
  errno = ECHILD;
  return -1;
}
