# protoc-gen-grpc 项目需求记录

## 核心需求
- 2026-08-07: 用户要求"看一下当前项目优化方向"——即审查仓库现状，梳理可优化的方向（仅分析，不实施改动）。
- 2026-08-07: 用户要求"从 P1～P5 设置优先级"——将优化方向整理为五级优先级排序。
- 2026-08-07: 用户确认方案：先做单元测试（全覆盖），保存输出与测试结果；之后改动代码时保证各接口输出基本不变（golden 回归基线）。
- 2026-08-07: 测试基线已落地：82 个测试全部通过，golden 输出与测试结果已保存。
- 2026-08-07: 用户同意开始 P0-A（supported_features + 合成 oneof 过滤），前置条件：合并 Dependabot 分支；后续修改在独立分支 codex/optimizations 上进行。
- 2026-08-07: P0-A 已完成：声明 FEATURE_PROTO3_OPTIONAL + 过滤合成 oneof；87 个测试全绿；真实 protoc 端到端实证通过。
- 2026-08-07: 用户偏好：不需要推送，之后不再提醒推送事项。
- 2026-08-07: 开始 P2：参数逗号解析 + 错误写入 CodeGeneratorResponse.error 并带上下文。
- 2026-08-07: P2 已完成：参数按逗号解析（grpc_js,keep_case 实证通过）、错误经 response.error 上报（不再 process.exit）、错误信息含文件名/消息名/字段名；88 个测试全绿。
- 2026-08-07: 用户指令：若存在客户端使用变化，更新 README（P0-A/P2 已造成使用变化，README 已同步更新）。
- 2026-08-07: 修复两个行为 bug：EntryMap 无 package 时作用域拼接带前导点（顶层/嵌套 enum 与嵌套 message 查找失败）；FileDescriptorMSG 不过滤 google/api/annotations.proto。90 个测试全绿，真实 protoc 实证通过。
- 2026-08-07: 用户要求暂停任务，重新规划项目优化方向，并列出每项的优化点/原因/不处理的结果/处理后的结果。
- 2026-08-07: 用户确认按顺序执行：CI → P4 可维护性重构 → 发布整洁 → 其余跟踪项。
- 2026-08-07: CI（GitHub Actions，node 20/22，npm ci --ignore-scripts）已提交 f376014；P4 重构完成（JSON 模板克隆换工厂函数、FieldTypes 魔法数字换枚举），90 测试全绿、golden 零变化。
- 2026-08-07: 发布整洁完成：package.json 加 files 白名单（5 个 bin 脚本 + build，不含下载二进制）；build/ 取消 git 跟踪（prepare 发布前自动构建）；npm pack 包体积 3.3MB → 13.7kB。
- 2026-08-07: 开始依赖升级（第 8 项）：grpc-js 1.14.4、node-pre-gyp 2.0.3、@types/node 22、typescript 5.9、rimraf 6；google-protobuf 保持 3.21.4（4.x 破坏性，待单独评估）。
- 2026-08-07: 依赖升级完成：npm audit 从 5 个漏洞（含 1 critical）降到 0；tar 显式声明为直接依赖修复 node-pre-gyp 链的 critical（overrides 对 bundleDependencies 无效，npm 11 行为）；90 测试全绿。

## 关键参数
- 项目: protoc-gen-grpc v3.0.0（protoc 插件，为 gRPC TypeScript 生成 *_pb.d.ts / *_grpc_pb.d.ts，基于 jspb / google-protobuf）
- 分支: master，工作区干净；最后提交 2025-03-04 "Update v3.0.0"
- 定位: ts-protoc-gen 的 fork + node-pre-gyp 捆绑 protoc/grpc 二进制
- 工作分支: codex/optimizations（2026-08-07 创建，后续所有修改在此分支）
- 依赖合并: 2026-08-07 已合并 6 个 Dependabot 分支（@grpc/grpc-js 1.12.7、protobufjs 7.6.1、@protobufjs/utf8 1.1.1，主包+examples），octopus merge 4e66fb0
- 优先级排序（用户已确认分级）:
  - P0(候选): proto3 optional 硬阻断（实证：protoc 拒绝生成，报错 "hasn't been updated to support optional fields in proto3"）
  - P0(候选): 安装链路/供应链风险（node-pre-gyp 从 grpc.io 下载二进制；捆绑 libprotoc 3.19.1，2021 年产物）
  - P1: 测试基线与 CI
  - P2: 生成器正确性缺口（supported_features / 参数解析 / 错误上报 / 合成 oneof 过滤）
  - P3: 依赖现代化（legacy grpc 分支 / grpc-tools 二进制升级 / node engines / 双 lockfile）
  - P4: 可维护性重构（JSON 模板克隆 / 魔法数字 / Printer）
  - P5: 发布与工程化打磨（files 白名单 / build 入库 / README 过时）

## 数据源
- 仓库: github.com/stultuss/protoc-gen-grpc-ts（origin，git@github.com:stultuss/protoc-gen-grpc-ts.git）
- 主要源码: src/index.ts、src/lib/*.ts、src/lib/descriptor/**（共约 1050 行 TS）

## 已知问题
- 2026-08-07 实证: ./bin/protoc --version = libprotoc 3.19.1（捆绑 grpc-tools v1.13.0，2021 年产物）
- 2026-08-07: P0-B 调查结论——grpc-tools 无新版可升（1.13.0 为最新）；下载源 2026-08-07 实测 HTTP 200 可用（2025-06 曾 DNS 故障）；完整工具链依赖 protoc + grpc_node_plugin 两个二进制。决策：保留捆绑架构，README 补充 npm_config_grpc_tools_binary_host_mirror 镜像配置与已知限制；等上游 grpc-node 把二进制发到 npm（issue #2967）再跟进。
- 2026-08-07: proto3 optional 硬阻断已修复（P0-A），端到端实证 protoc exit=0，输出含 has/clear 且无合成 oneof Case 枚举
- 2026-08-07 测试基线发现的真实行为（测试已固化）:
  - [已修复] 无 package 的 proto 文件类型查找（joinScope 统一拼接，无前导点）
  - [已修复 P2] 插件参数按逗号解析，grpc_js 在参数列表中即生效；错误经 response.error 上报
  - 无法解析的 stdin 不会报错，返回空响应且退出码 0（健壮性缺口，暂保留现状）
  - [已修复] FileDescriptorMSG 与 FileDescriptorGRPC 一致过滤 google/api/annotations.proto
- 无测试、无 CI（.travis.yml 在 v3.0.0 中被删除）
- 未声明 CodeGeneratorResponse.supported_features（proto3 optional / editions）
- 非 grpc-js 分支引用已废弃的 npm `grpc` 包
- node-pre-gyp 固定下载 grpc-tools v1.13.0 二进制；engines node >=16 已 EOL
- package.json 无 files 白名单；build/ 产物被提交进 git；package-lock.json 与 yarn.lock 双锁并存
- README 多处过时（M1 变通、unsafe-perm、Travis badge）
- 代码风格: JSON.stringify/parse 做默认模板克隆、FieldTypes 使用魔法数字

## 用户纠正记录
- 2026-08-07: 偏好：不推送、不提醒推送（原: 汇报里提到推送 → 改: 全部省略）
- 2026-08-07: 决策：删除 yarn.lock（主包与 examples），保留 npm package-lock.json；.gitignore 增加 yarn.lock 防止误提交（原: 双 lockfile 并存 → 改: 只保留 npm lockfile）
- 2026-08-07: 决策：legacy grpc 代码保留现状（不删除），改为 README 顶部醒目 WARNING 提醒用户必须传 grpc_js 参数（原: 待决策 → 改: 保留 + 文档提醒）

## 待解决问题
- 待用户确认优先方向后，再决定是否实施（例如先补测试与 CI，还是先修功能缺口）
- 本阶段已完成：搭建测试基线（未修改 src 生产逻辑），后续重构以 golden 输出对比作为回归保障
- 后续改动时：npm test 全绿 + 有意变更输出时运行 npm run test:update-golden 并人工审查 diff

## 测试基线验证记录（2026-08-07）
- 覆盖率: 行 100%、函数 100%、分支 98.49%（未覆盖分支为非法 proto 组合，如 message 类型的 map key）
- 真实性: 用等价于 examples/proto/product.proto 的描述符生成，与仓库已提交的 examples/src/proto/product_pb.d.ts / product_grpc_pb.d.ts 逐字节一致（3597/7381 bytes）
- 变异测试: 7 处故意改坏（snakeToCamel、Printer 缩进、bool 类型映射、unary handler、isGrpcJs 反转、annotations 过滤、bytes _asU8），分别触发 21/57/13/13/9/11/9 个用例失败，全部可被捕获
- 结论: 测试断言真实有效；golden 基线可信；npm test 86 用例全绿

## 聊天上下文
- 2026-08-07: "看一下当前项目优化方向。"
- 2026-08-07: "从 P1～P5 设置优先级。"
- 2026-08-07: "有 P0 级的吗？"（回答：两个准 P0——proto3 optional 功能硬阻断、安装/供应链风险）
- 2026-08-07: "先做一次单元测试吧，并保存输出和测试结果…然后我们再改动代码，确保各接口改动后输出保持基本不变。"
- 2026-08-07: "确认构建的单元测试是否正确。"（完成覆盖率 + 真实文件对比 + 变异测试三重验证）
- 2026-08-07: "提交"（提交 2d134df 测试基线）
- 2026-08-07: "可以。但需要先将依赖bot的git合并过来"（合并 6 个 Dependabot 分支）
- 2026-08-07: "记得创建一个测试用分支，后续修改用该分支"（创建 codex/optimizations）
