# Unit 2: Exponential & Logarithmic Functions — Authoritative Reference Notes

=== SOURCE START: Topic 2.1 — Change in Arithmetic and Geometric Sequences (appc_2.1_packet.pdf & appc_2.1_ca1.pdf) ===

#### **Core Definitions & Analytic Formulas**
* **Sequence**: An ordered list of numbers where each number is a term. The graph of a sequence consists of discrete points $(n, a_n)$ rather than a connected curve.
* **Arithmetic Sequence**: A sequence where consecutive terms change by a constant additive common difference $d = a_n - a_{n-1}$.
  * Explicit formula relative to initial term $k = 0$: 
    $$a_n = a_0 + d \cdot n$$
  * Explicit formula relative to any general term $k$: 
    $$a_n = a_k + d(n - k)$$
* **Geometric Sequence**: A sequence where consecutive terms change by a constant multiplicative common ratio $r = \frac{g_n}{g_{n-1}}$.
  * Explicit formula relative to initial term $k = 0$: 
    $$g_n = g_0 \cdot r^n$$
  * Explicit formula relative to any general term $k$: 
    $$g_n = g_k \cdot r^{n - k}$$

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.1_ca1.pdf #1)**:
   * *Statement*: Find an equation that gives the $n$-th term of the sequence $\{57, 42, 27, 12, \dots\}$ using initial value $k = 0$.
   * *Solution Step-by-Step*:
     1. Calculate common difference: $d = 42 - 57 = -15$.
     2. Identify term $a_1 = 57$.
     3. Backtrack to find zero term $a_0 = a_1 - d = 57 - (-15) = 72$.
     4. Apply initial term equation: 
        $$a_n = 72 - 15n$$

2. **Problem 2 (appc_2.1_ca1.pdf #4)**:
   * *Statement*: Find an equation for the $n$-th term of $\{192, 48, 12, 3, \dots\}$ using $k = 1$.
   * *Solution Step-by-Step*:
     1. Calculate common ratio: $r = \frac{48}{192} = \frac{1}{4}$.
     2. Identify $g_1 = 192$ (for $k = 1$).
     3. Apply relative term equation $g_n = g_k \cdot r^{n - k}$:
        $$g_n = 192 \left(\frac{1}{4}\right)^{n - 1}$$

3. **Problem 3 (appc_2.1_packet.pdf #19)**:
   * *Statement*: The first term of an arithmetic sequence is $a_1 = 4$, and the common difference is $d = 3$. What is the 7th term of the sequence?
     * (A) 22
     * (B) 25
     * (C) 972
     * (D) 2,916
   * *Solution Step-by-Step*:
     1. Write explicit equation using $k = 1$: $a_n = a_1 + d(n - 1) = 4 + 3(n - 1)$.
     2. Substitute $n = 7$: $a_7 = 4 + 3(7 - 1) = 4 + 3(6) = 22$.
     3. Correct Answer: **(A)**.

4. **Problem 4 (appc_2.1_ca1.pdf #7)**:
   * *Statement*: Find the 65th term of the arithmetic sequence $\{107, 97, 87, 77, \dots\}$.
   * *Solution Step-by-Step*:
     1. Identify $d = 97 - 107 = -10$.
     2. Calculate zero term $a_0 = 107 - (-10) = 117$.
     3. Write formula: $a_n = 117 - 10n$.
     4. Evaluate for $n = 65$: $a_{65} = 117 - 10(65) = 117 - 650 = -533$.

---

=== SOURCE START: Topic 2.2 — Change in Linear and Exponential Functions (appc_2.2_packet.pdf & appc_2.2_ca1.pdf) ===

#### **Core Definitions & Analytic Formulas**
* **Linear Growth**: Output values change by constant additive increments over equal-length input intervals.
  * Point-Slope Form: 
    $$y - y_1 = m(x - x_1) \quad \text{where } m = \frac{y_2 - y_1}{x_2 - x_1}$$
* **Exponential Growth**: Output values change by constant multiplicative factors over equal-length input intervals.
  * Point-Ratio Form: 
    $$y = y_1 \cdot (r)^{\frac{x - x_1}{x_2 - x_1}} \quad \text{where } r = \frac{y_2}{y_1}$$

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.2_packet.pdf #20)**:
   * *Statement*: It is known that $y$ is an exponential function passing through $(1, 4)$ and $(3, 10)$. Write an equation for this function.
   * *Solution Step-by-Step*:
     1. Set up growth ratio over interval $\Delta x = 3 - 1 = 2$:
        $$\frac{y_2}{y_1} = \frac{10}{4} = \frac{5}{2}$$
     2. Solve for unit growth factor $r$:
        $$r^2 = \frac{5}{2} \implies r = \sqrt{\frac{5}{2}}$$
     3. Construct explicit equation relative to $(1, 4)$:
        $$y = 4 \left(\sqrt{\frac{5}{2}}\right)^{x - 1} \quad \text{or relative to } (3, 10): \quad y = 10 \left(\sqrt{\frac{5}{2}}\right)^{x - 3}$$

2. **Problem 2 (appc_2.2_ca1.pdf #1)**:
   * *Statement*: A function passes through $(2, 5)$, $(1, 8)$, and $(0, 11)$. Could it represent a linear function, exponential function, or neither?
   * *Solution Step-by-Step*:
     1. Order input values: $x = 0, 1, 2$.
     2. Check output differences: $8 - 11 = -3$, $5 - 8 = -3$.
     3. Constant additive change $\Delta y = -3$ for $\Delta x = 1$ confirms the function is **Linear**.

3. **Problem 3 (appc_2.2_packet.pdf #17)**:
   * *Statement*: Write an equation for a linear function passing through $(1, 4)$ and $(3, 10)$.
   * *Solution Step-by-Step*:
     1. Calculate constant slope:
        $$m = \frac{10 - 4}{3 - 1} = \frac{6}{2} = 3$$
     2. Write point-slope equation using $(1, 4)$:
        $$y = 3(x - 1) + 4 \quad \text{or using } (3, 10): \quad y = 3(x - 3) + 10$$

---

=== SOURCE START: Topic 2.3 — Exponential Functions (appc_2.3_packet.pdf & appc_2.3_ca1.pdf) ===

#### **Core Definitions & Graphical Features**
* **General Analytical Form**: 
  $$f(x) = a \cdot b^x + k$$
* **Growth vs. Decay Classification**:
  * **Exponential Growth**: Occurs when initial scale coefficient $a > 0$ and base factor $b > 1$.
  * **Exponential Decay**: Occurs when initial scale coefficient $a > 0$ and $0 < b < 1$.
* **Global Graphical Properties**:
  * **Horizontal Asymptote**: Line $y = k$.
  * **Domain**: $(-\infty, \infty)$.
  * **Range**: $(k, \infty)$ for $a > 0$, or $(-\infty, k)$ for $a < 0$.
  * **Monotonicity**: Always strictly increasing or strictly decreasing across its entire domain (no relative extrema).

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.3_ca1.pdf #3)**:
   * *Statement*: Identify whether $f(x) = 5.7 (0.2)^x$ represents exponential growth or decay and justify.
   * *Solution Step-by-Step*:
     1. Identify parameters: $a = 5.7$ and base $b = 0.2$.
     2. Check conditions: $a > 0$ and $0 < b = 0.2 < 1$.
     3. Conclusion: **Exponential Decay**.

2. **Problem 2 (appc_2.3_packet.pdf #5)**:
   * *Statement*: The expression $4 \cdot 4 \cdot 4 \cdot 1.5$ represents an output value of an exponential function $f(x) = a \cdot b^x$. Write the function and the corresponding input value $x$.
   * *Solution Step-by-Step*:
     1. Identify the base factor repeated in multiplication: $b = 4$.
     2. Count the number of base factors: 3 factors of 4, so $x = 3$.
     3. Identify the initial scalar coefficient: $a = 1.5$.
     4. Formulate function and input:
        $$f(x) = 1.5 (4)^x \quad \text{evaluated at } x = 3$$

3. **Problem 3 (appc_2.3_packet.pdf #14)**:
   * *Statement*: For $f(x) = 4(0.3)^x$, evaluate $\lim_{x \to \infty} f(x)$.
   * *Solution Step-by-Step*:
     1. Note base $b = 0.3$ satisfies $0 < b < 1$.
     2. As $x \to \infty$, $(0.3)^x \to 0$.
     3. Therefore:
        $$\lim_{x \to \infty} 4(0.3)^x = 0$$

---

=== SOURCE START: Topic 2.4 — Exponential Function Manipulation (appc_2.4_packet.pdf & appc_2.4_ca1.pdf) ===

#### **Core Theorems & Algebraic Transformations**
* **Base Change Equivalency**: 
  $$f(x) = b^{cx} = (b^c)^x$$
  * A horizontal dilation by a factor of $\frac{1}{c}$ on $b^x$ is algebraically identical to a change of base to $b^c$.
* **Shift-Scale Equivalency**: 
  $$g(x) = b^{x + c} = b^c \cdot b^x$$
  * A horizontal shift left by $c$ units is algebraically identical to a vertical stretch by factor $b^c$.
* **Fractional Exponents & Radicals**: 
  $$b^{1/k} = \sqrt[k]{b}$$

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.4_ca1.pdf #1)**:
   * *Statement*: Let $f(x) = 3^x$ and $g(x) = f(x) \cdot 27$. Name the transformation on $f$.
   * *Solution Step-by-Step*:
     1. Rewrite constant multiplier in base 3: $27 = 3^3$.
     2. Substitute into $g(x)$:
        $$g(x) = 3^x \cdot 3^3 = 3^{x + 3}$$
     3. Conclusion: **Horizontal shift left by 3 units**.

2. **Problem 2 (appc_2.4_ca1.pdf #7)**:
   * *Statement*: Let $f(x) = 16^x$ and $g(x) = 2^x$. Describe the transformation converting $f$ into $g$.
   * *Solution Step-by-Step*:
     1. Express 16 as a power of 2: $16 = 2^4$.
     2. Rewrite $f(x) = (2^4)^x = 2^{4x}$.
     3. Compare $g(x) = 2^x = f(x/4)$.
     4. Conclusion: **Horizontal dilation by a factor of 4** (or horizontal stretch by 4).

3. **Problem 3 (appc_2.4_packet.pdf #6)**:
   * *Statement*: Let $h(x) = 2 \cdot 5^{x/3}$. Evaluate $h(1)$.
   * *Solution Step-by-Step*:
     1. Substitute $x = 1$:
        $$h(1) = 2 \cdot 5^{1/3}$$
     2. Convert rational exponent to radical form:
        $$h(1) = 2 \sqrt[3]{5}$$

---

=== SOURCE START: Topic 2.5 — Exponential Function Context and Data Modeling (appc_2.5.a_packet.pdf & appc_2.5b_packet.pdf) ===

#### **Core Modeling Formulas**
* **Shifted Exponential Model Determination**:
  * For tabular output data $y_n$, evaluate first differences $\Delta y_n = y_{n+1} - y_n$. If $\Delta y_n$ exhibits a constant multiplicative ratio $b$, the dataset is modeled by $f(x) = a \cdot b^x + k$.
* **Natural Exponential Growth/Decay**: 
  $$f(t) = a \cdot e^{rt} \quad \text{where } e \approx 2.71828$$
* **Percentage Rate Model**: 
  $$f(t) = a(1 \pm r)^t$$
* **Half-Life Decay Model**: 
  $$f(t) = a \left(\frac{1}{2}\right)^{t/h} \quad \text{where } h = \text{half-life period}$$
* **Doubling Time Growth Model**: 
  $$f(t) = a (2)^{t/d} \quad \text{where } d = \text{doubling period}$$

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.5.a_packet.pdf #1)**:
   * *Statement*: Determine an equation $f(x) = a \cdot b^x + k$ for the table:
     $$\begin{array}{|c|c|c|c|c|c|} \hline x & 0 & 1 & 2 & 3 & 4 \\ \hline f(x) & 6 & 12 & 36 & 132 & 516 \\ \hline \end{array}$$
   * *Solution Step-by-Step*:
     1. Compute consecutive differences: 
        $$\Delta y_0 = 12 - 6 = 6, \quad \Delta y_1 = 36 - 12 = 24, \quad \Delta y_2 = 132 - 36 = 96, \quad \Delta y_3 = 516 - 132 = 384$$
     2. Find constant ratio of differences: 
        $$b = \frac{24}{6} = \frac{96}{24} = \frac{384}{96} = 4$$
     3. Set up system $f(x) = a \cdot 4^x + k$:
        * For $x = 0$: $a(4^0) + k = 6 \implies a + k = 6 \implies k = 6 - a$.
        * For $x = 1$: $a(4^1) + k = 12 \implies 4a + k = 12$.
     4. Substitute $k$: $4a + (6 - a) = 12 \implies 3a + 6 = 12 \implies 3a = 6 \implies a = 2$.
     5. Find $k$: $k = 6 - 2 = 4$.
     6. Complete Model:
        $$f(x) = 2 \cdot 4^x + 4$$

2. **Problem 2 (appc_2.5b_packet.pdf #4)**:
   * *Statement*: Identify the percent increase or decrease of $f(x) = 801 (0.965)^x$.
   * *Solution Step-by-Step*:
     1. Extract base $b = 0.965$.
     2. Since $b < 1$, set $1 - r = 0.965 \implies r = 1 - 0.965 = 0.035$.
     3. Convert to percentage: $0.035 = 3.5\%$.
     4. Conclusion: **3.5% decrease per unit input**.

---

=== SOURCE START: Topic 2.6 — Competing Function Model Validation (appc_2.6_packet.pdf) ===

#### **Residual Analysis & Validation Rules**
* **Residual Definition**: 
  $$\text{Residual} = y_i - \hat{y}_i = \text{Actual Value} - \text{Predicted Value}$$
* **Model Selection Criteria**:
  * **Appropriate Model**: Residual plot displays a completely random scatter around the horizontal zero axis.
  * **Inappropriate Model**: Residual plot displays a distinct curved pattern or systematic trend.

---

=== SOURCE START: Topic 2.7 — Composition of Functions and Decomposition (appc_2.7a_packet.pdf & appc_2.7b_packet.pdf) ===

#### **Core Definitions & Methods**
* **Composite Function**: 
  $$(f \circ g)(x) = f(g(x))$$
* **Composite Domain**: Set of all $x$ in the domain of $g$ such that $g(x)$ falls within the domain of $f$.
* **Function Decomposition**: Given $h(x) = f(g(x))$, isolate an inner algebraic function $u = g(x)$ and outer function $f(u)$.

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.7b_packet.pdf)**:
   * *Statement*: Decompose $h(x) = e^{2 - 5x}$ into non-trivial inner $g(x)$ and outer $f(x)$.
   * *Solution Step-by-Step*:
     1. Identify the inner expression: $g(x) = 2 - 5x$.
     2. Identify the outer primary function acting on that expression: $f(u) = e^u$.
     3. Verify composition: $f(g(x)) = f(2 - 5x) = e^{2 - 5x} = h(x)$.

2. **Problem 2 (appc_2.7a_ca1.pdf)**:
   * *Statement*: Determine the domain of $(f \circ g)(x)$ for $f(x) = \sqrt{4 - x}$ and $g(x) = x^2$.
   * *Solution Step-by-Step*:
     1. Form composite expression: $f(g(x)) = f(x^2) = \sqrt{4 - x^2}$.
     2. Require non-negative radicand for real outputs:
        $$4 - x^2 \ge 0 \implies x^2 \le 4 \implies -2 \le x \le 2$$
     3. Domain in interval notation: **$[-2, 2]$**.

---

=== SOURCE START: Topic 2.8 — Inverse Functions (appc_2.8_packet.pdf & appc_2.8_ca1.pdf) ===

#### **Core Properties & Algebraic Inversion**
* **Inverse Identity**: $f(a) = b \iff f^{-1}(b) = a$.
* **Domain & Range Swap**:
  $$\text{Domain}(f^{-1}) = \text{Range}(f) \quad \text{and} \quad \text{Range}(f^{-1}) = \text{Domain}(f)$$
* **Composition Verification Test**: $f(f^{-1}(x)) = x$ and $f^{-1}(f(x)) = x$.

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.8_ca1.pdf)**:
   * *Statement*: Find the inverse equation for $f(x) = \sqrt{x - 7} + 1$.
   * *Solution Step-by-Step*:
     1. Note domain of $f$: $x \ge 7$, giving range $y \ge 1$.
     2. Swap variables: $x = \sqrt{y - 7} + 1$.
     3. Isolate radical: $x - 1 = \sqrt{y - 7}$.
     4. Square both sides: $(x - 1)^2 = y - 7 \implies y = (x - 1)^2 + 7$.
     5. Apply domain constraint from original range:
        $$f^{-1}(x) = (x - 1)^2 + 7 \quad \text{for } x \ge 1$$

---

=== SOURCE START: Topic 2.9 — Logarithmic Expressions (appc_2.9_packet.pdf & ap_pc_2.9_ca_1.pdf) ===

#### **Core Definition & Special Bases**
* **Logarithm Definition**: 
  $$\log_b(x) = y \iff b^y = x \quad \text{where } b > 0, b \neq 1, x > 0$$
* **Common Logarithm**: $\log_{10}(x) = \log(x)$.
* **Natural Logarithm**: $\log_e(x) = \ln(x)$.

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (ap_pc_2.9_ca_1.pdf)**:
   * *Statement*: Evaluate $\log_3\left(\frac{1}{27}\right)$ without a calculator.
   * *Solution Step-by-Step*:
     1. Set $y = \log_3\left(\frac{1}{27}\right) \iff 3^y = \frac{1}{27}$.
     2. Express $\frac{1}{27}$ as power of 3: $\frac{1}{27} = 3^{-3}$.
     3. Equate exponents: $y = -3$.

2. **Problem 2 (ap_pc_2.9_ca_1.pdf)**:
   * *Statement*: Evaluate $\log_{16}(4)$.
   * *Solution Step-by-Step*:
     1. Set $16^y = 4$.
     2. Since $\sqrt{16} = 4 \implies 16^{1/2} = 4$, we find $y = \frac{1}{2}$.

---

=== SOURCE START: Topic 2.10 — Inverses of Exponential Functions (appc_2.10_packet.pdf & ap_pc_2.10_ca_1.pdf) ===

#### **Algebraic Inversion Protocol**
* To invert $y = a \cdot b^{c(x - h)} + k$:
  1. Swap $x$ and $y$: $x = a \cdot b^{c(y - h)} + k$.
  2. Isolate exponential base: $b^{c(y - h)} = \frac{x - k}{a}$.
  3. Convert to logarithmic form: $c(y - h) = \log_b\left(\frac{x - k}{a}\right)$.
  4. Isolate $y$: 
     $$f^{-1}(x) = \frac{1}{c} \log_b\left(\frac{x - k}{a}\right) + h$$

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (ap_pc_2.10_ca_1.pdf)**:
   * *Statement*: Find the inverse function for $f(x) = 2 \cdot 4^{x - 1} - 8$.
   * *Solution Step-by-Step*:
     1. Swap variables: $x = 2 \cdot 4^{y - 1} - 8$.
     2. Add 8: $x + 8 = 2 \cdot 4^{y - 1}$.
     3. Divide by 2: $\frac{x + 8}{2} = 4^{y - 1}$.
     4. Take $\log_4$: $y - 1 = \log_4\left(\frac{x + 8}{2}\right)$.
     5. Add 1:
        $$f^{-1}(x) = \log_4\left(\frac{x + 8}{2}\right) + 1$$

---

=== SOURCE START: Topic 2.11 — Logarithmic Functions (updated_ap_pc_2.11_packet.pdf & ap_pc_2.11_ca1.pdf) ===

#### **Transformed Logarithmic Curve Properties**
* **General Analytical Form**: 
  $$f(x) = a \log_b(x - h) + k$$
* **Key Features**:
  * **Vertical Asymptote**: Line $x = h$.
  * **Domain**: $(h, \infty)$ for $x - h > 0$.
  * **Range**: $(-\infty, \infty)$.
  * **End Behaviors**: As $x \to h^+$, $f(x) \to -\infty$ (for $a > 0, b > 1$). As $x \to \infty$, $f(x) \to \infty$.

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (ap_pc_2.11_ca1.pdf)**:
   * *Statement*: Determine vertical asymptote and domain for $f(x) = \ln(4 - x) + 2$.
   * *Solution Step-by-Step*:
     1. Set argument equal to zero for asymptote: $4 - x = 0 \implies x = 4$.
     2. Set argument greater than zero for domain: $4 - x > 0 \implies x < 4$.
     3. Domain: **$(-\infty, 4)$**.
     4. Vertical Asymptote: **$x = 4$**.

---

=== SOURCE START: Topic 2.12 — Logarithmic Function Manipulation (appc_2.12_packet.pdf & ap_pc_2.12_ca1.pdf) ===

#### **Core Logarithmic Expansion Properties**
* **Product Rule**: $\log_b(xy) = \log_b(x) + \log_b(y)$.
* **Quotient Rule**: $\log_b\left(\frac{x}{y}\right) = \log_b(x) - \log_b(y)$.
* **Power Rule**: $\log_b(x^p) = p \log_b(x)$.
* **Change of Base Formula**: $\log_b(x) = \frac{\log_c(x)}{\log_c(b)} = \frac{\ln(x)}{\ln(b)}$.

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.12_packet.pdf #13)**:
   * *Statement*: Describe transformations and find domain/range for $f(x) = \log_4(16x)$.
   * *Solution Step-by-Step*:
     1. Apply Product Rule:
        $$f(x) = \log_4(16) + \log_4(x) = \log_4(x) + 2$$
     2. Transformation: Vertical shift up by 2 units (equivalent to horizontal compression by factor of $1/16$).
     3. Domain: $(0, \infty)$, Range: $(-\infty, \infty)$.

2. **Problem 2 (appc_2.12_packet.pdf #10)**:
   * *Statement*: Condense $3\log_5(x - 4) - 2\log_5(y)$ into a single logarithm.
   * *Solution Step-by-Step*:
     1. Apply Power Rule: $\log_5((x - 4)^3) - \log_5(y^2)$.
     2. Apply Quotient Rule:
        $$\log_5\left(\frac{(x - 4)^3}{y^2}\right)$$

---

=== SOURCE START: Topic 2.13 — Exponential and Logarithmic Equations and Inequalities (appc_2.13a_packet.pdf & appc_2.13b_packet.pdf) ===

#### **Equation & Inequality Methods**
* **Logarithmic Equality**: $\log_b(A) = \log_b(B) \implies A = B$, requiring verification that $A > 0$ and $B > 0$.
* **Extraneous Solution Rule**: Discard any algebraic candidate solutions that yield negative or zero arguments in original logarithmic terms.
* **Inequality Domain Bounds**: When solving $\log_b(f(x)) < C$ for $b > 1$, intersect solution of $f(x) < b^C$ with argument domain restriction $f(x) > 0$, yielding interval $0 < f(x) < b^C$.

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.13a_packet.pdf)**:
   * *Statement*: Solve $\log(x) + \log(x - 3) = 1$.
   * *Solution Step-by-Step*:
     1. Combine logs: $\log(x(x - 3)) = 1 \implies \log(x^2 - 3x) = 1$.
     2. Exponentiate base 10: $x^2 - 3x = 10^1 \implies x^2 - 3x - 10 = 0$.
     3. Factor quadratic: $(x - 5)(x + 2) = 0 \implies x = 5$ or $x = -2$.
     4. Check domain: $x = -2$ gives $\log(-2)$ (undefined!). Discard $x = -2$.
     5. Valid Solution: **$x = 5$**.

2. **Problem 2 (appc_2.13b_packet.pdf)**:
   * *Statement*: Solve $\ln(3x - 10) > \ln(5x - 28)$.
   * *Solution Step-by-Step*:
     1. Establish domain conditions for arguments:
        * $3x - 10 > 0 \implies x > 10/3 \approx 3.33$.
        * $5x - 28 > 0 \implies x > 28/5 = 5.6$.
        * Restrict domain to $x > 5.6$.
     2. Solve inequality on arguments ($b = e > 1$ preserves order):
        $$3x - 10 > 5x - 28 \implies -2x > -18 \implies x < 9$$
     3. Intersect $x > 5.6$ and $x < 9$:
        $$\text{Solution Set: } \left(\frac{28}{5}, 9\right)$$

---

=== SOURCE START: Topic 2.14 — Logarithmic Function Context and Data Modeling (appc_2.14_packet.pdf & ap_pc_2.14_ca1.pdf) ===

#### **Contextual Application Models**
* **Continuous Compound Interest**: 
  $$A(t) = P \cdot e^{rt}$$
* **Continuous Doubling Time Formula**: 
  $$2P = P e^{rt} \implies e^{rt} = 2 \implies t = \frac{\ln 2}{r}$$
* **Sound Intensity Decibels**: 
  $$D(I) = 10 \log_{10}\left(\frac{I}{10^{-12}}\right)$$

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (ap_pc_2.14_ca1.pdf)**:
   * *Statement*: An account with initial deposit $P = \$5,000$ earns $8.3\%$ annual interest compounded continuously. How many years $t$ will it take to reach $\$10,000$?
   * *Solution Step-by-Step*:
     1. Set up equation: $10000 = 5000 e^{0.083 t}$.
     2. Divide by 5000: $2 = e^{0.083 t}$.
     3. Apply natural log: $\ln(2) = 0.083 t$.
     4. Solve for $t$:
        $$t = \frac{\ln 2}{0.083} \approx \frac{0.693147}{0.083} \approx 8.351 \text{ years}$$

---

=== SOURCE START: Topic 2.15 — Semi-Log Plots (appc_2.15_packet.pdf & ap_pc_2.15_practice_solutions.pdf) ===

#### **Semi-Log Linearization Theory**
* **Semi-Log Axis Transformation**:
  * In a semi-log plot, input $x$ is plotted linearly, while output $y$ is plotted on a logarithmic scale ($\log y$).
* **Exponential Linearization**:
  * Given exponential data $y = a \cdot b^x$:
    $$\log(y) = \log(a \cdot b^x) = \log(a) + \log(b^x) = (\log b)x + \log a$$
  * This forms a linear relationship $Y = m x + c$ where:
    * Dependent variable $Y = \log y$
    * Slope $m = \log b$
    * Vertical intercept $c = \log a$

---

#### **Complete Worked Examples & Practice Problems**

1. **Problem 1 (appc_2.15_packet.pdf)**:
   * *Statement*: A linear regression on semi-log data $(x, \log_{10} y)$ yields $\log_{10} y = 0.3 x + 1.2$. Express the underlying relationship as an exponential model $y = a \cdot b^x$.
   * *Solution Step-by-Step*:
     1. Exponentiate base 10 on both sides:
        $$y = 10^{0.3 x + 1.2} = 10^{1.2} \cdot 10^{0.3 x} = 10^{1.2} \cdot (10^{0.3})^x$$
     2. Calculate scalar $a = 10^{1.2} \approx 15.849$.
     3. Calculate base $b = 10^{0.3} \approx 1.995$.
     4. Complete Exponential Model:
        $$y = 15.849(1.995)^x$$
