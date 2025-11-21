import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FootOfPerpendicularLearning = () => {
  const [pointA, setPointA] = useState({ x: 0, y: 1, z: 2 });
  const [linePoint, setLinePoint] = useState({ x: 0, y: 0, z: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1, z: 0 });
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({
    anx: '', any: '', anz: '',
    dotProduct: '',
    lambda: '',
    nx: '', ny: '', nz: ''
  });
  const [feedback, setFeedback] = useState({});
  const [showHint, setShowHint] = useState({});

  // Convert decimal to fraction
  const decimalToFraction = (decimal) => {
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    
    do {
      let a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
    
    return { numerator: h1, denominator: k1 };
  };

  // Format number as fraction string
  const formatFraction = (num) => {
    if (Math.abs(num) < 0.0001) return '0';
    
    const sign = num < 0 ? '-' : '';
    const absNum = Math.abs(num);
    
    // Check if it's close to an integer
    if (Math.abs(absNum - Math.round(absNum)) < 0.0001) {
      return sign + Math.round(absNum).toString();
    }
    
    const frac = decimalToFraction(absNum);
    if (frac.denominator === 1) {
      return sign + frac.numerator.toString();
    }
    return sign + frac.numerator + '/' + frac.denominator;
  };

  // Parse fraction or decimal input
  const parseFractionInput = (input) => {
    if (!input || input.trim() === '') return NaN;
    
    const trimmed = input.trim();
    
    // Check if it's a fraction
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const denom = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
          return num / denom;
        }
      }
    }
    
    // Otherwise parse as decimal
    return parseFloat(trimmed);
  };

  // Calculate correct answers using standard template
  const getCorrectAnswers = () => {
    const { x: ax, y: ay, z: az } = pointA;
    const { x: px, y: py, z: pz } = linePoint;
    const { x: bx, y: by, z: bz } = direction;

    const diff_x = px - ax;
    const diff_y = py - ay;
    const diff_z = pz - az;
    
    const diff_dot_b = diff_x * bx + diff_y * by + diff_z * bz;
    const bDotB = bx * bx + by * by + bz * bz;
    
    const lambda = -diff_dot_b / bDotB;
    
    const nx = px + lambda * bx;
    const ny = py + lambda * by;
    const nz = pz + lambda * bz;
    
    const anx = nx - ax;
    const any = ny - ay;
    const anz = nz - az;
    
    return { 
      lambda, nx, ny, nz, 
      anx, any, anz,
      diff_dot_b, bDotB,
      diff_x, diff_y, diff_z
    };
  };

  const checkAnswer = (step, field, userValue) => {
    const correct = getCorrectAnswers();
    const tolerance = 0.01;
    const userNum = parseFractionInput(userValue);
    
    if (isNaN(userNum)) {
      return { isCorrect: false, message: 'Please enter a valid number or fraction (e.g., 1/2)' };
    }

    const isCorrect = Math.abs(userNum - correct[field]) < tolerance;
    return {
      isCorrect,
      message: isCorrect 
        ? '✓ Correct!' 
        : `✗ Not quite. The correct answer is ${formatFraction(correct[field])}`
    };
  };

  const handleStepSubmit = (step) => {
    let allCorrect = true;
    const newFeedback = {};

    if (step === 1) {
      ['anx', 'any', 'anz'].forEach(field => {
        const result = checkAnswer(step, field, userAnswers[field]);
        newFeedback[field] = result;
        if (!result.isCorrect) allCorrect = false;
      });
    } else if (step === 2) {
      const result = checkAnswer(step, 'dotProduct', userAnswers.dotProduct);
      newFeedback.dotProduct = result;
      if (!result.isCorrect) allCorrect = false;
    } else if (step === 3) {
      const result = checkAnswer(step, 'lambda', userAnswers.lambda);
      newFeedback.lambda = result;
      if (!result.isCorrect) allCorrect = false;
    } else if (step === 4) {
      ['nx', 'ny', 'nz'].forEach(field => {
        const result = checkAnswer(step, field, userAnswers[field]);
        newFeedback[field] = result;
        if (!result.isCorrect) allCorrect = false;
      });
    }

    setFeedback(newFeedback);

    if (allCorrect) {
      setTimeout(() => {
        setCurrentStep(step + 1);
        setFeedback({});
        setShowHint({});
      }, 1500);
    }
  };

  const loadExample = (exampleNum) => {
    const examples = [
      {
        pointA: { x: 0, y: 1, z: 2 },
        linePoint: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 1, z: 0 }
      },
      {
        pointA: { x: 3, y: 4, z: 5 },
        linePoint: { x: 1, y: 2, z: 3 },
        direction: { x: 2, y: -1, z: 1 }
      },
      {
        pointA: { x: 2, y: 0, z: 3 },
        linePoint: { x: 1, y: 1, z: 1 },
        direction: { x: 1, y: 2, z: -1 }
      }
    ];
    
    const ex = examples[exampleNum];
    setPointA(ex.pointA);
    setLinePoint(ex.linePoint);
    setDirection(ex.direction);
    setCurrentStep(0);
    setUserAnswers({
      anx: '', any: '', anz: '',
      dotProduct: '',
      lambda: '',
      nx: '', ny: '', nz: ''
    });
    setFeedback({});
    setShowHint({});
  };

  const resetProblem = () => {
    setCurrentStep(0);
    setUserAnswers({
      anx: '', any: '', anz: '',
      dotProduct: '',
      lambda: '',
      nx: '', ny: '', nz: ''
    });
    setFeedback({});
    setShowHint({});
  };

  const InputWithFeedback = ({ field, label, placeholder }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={userAnswers[field]}
        onChange={(e) => setUserAnswers({...userAnswers, [field]: e.target.value})}
        placeholder={placeholder || "Enter number or fraction (e.g., 1/2)"}
        className={`w-full px-3 py-2 border-2 rounded ${
          feedback[field]?.isCorrect ? 'border-green-500 bg-green-50' : 
          feedback[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      {feedback[field] && (
        <p className={`text-sm mt-1 ${feedback[field].isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {feedback[field].message}
        </p>
      )}
    </div>
  );

  // Vector with arrow on top (for position vectors like ON, AN, OA)
  const Vec = ({ children }) => (
    <span style={{ 
      position: 'relative', 
      display: 'inline-block', 
      fontWeight: 'bold',
      paddingTop: '10px'
    }}>
      <span style={{ 
        position: 'absolute', 
        top: '0px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        fontSize: '16px',
        fontWeight: 'normal'
      }}>→</span>
      <span>{children}</span>
    </span>
  );

  // Bold vector without arrow (for direction vectors a, b)
  const BoldVec = ({ children }) => (
    <span style={{ fontWeight: 'bold' }}>{children}</span>
  );

  // Italic for line l
  const Italic = ({ children }) => (
    <span style={{ fontStyle: 'italic' }}>{children}</span>
  );

  // Column vector notation with proper rounded parentheses
  const VectorNotation = ({ x, y, z }) => (
    <span className="inline-flex items-stretch" style={{ verticalAlign: 'middle', margin: '0 2px' }}>
      <span style={{ 
        fontSize: '48px', 
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        color: '#333',
        fontWeight: 'normal'
      }}>(</span>
      <span className="inline-flex flex-col justify-center" style={{ 
        fontSize: '16px', 
        lineHeight: '1.4',
        padding: '2px 4px',
        minHeight: '60px',
        display: 'flex',
        justifyContent: 'space-evenly'
      }}>
        <span>{x}</span>
        <span>{y}</span>
        <span>{z}</span>
      </span>
      <span style={{ 
        fontSize: '48px', 
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        color: '#333',
        fontWeight: 'normal'
      }}>)</span>
    </span>
  );

  const correct = getCorrectAnswers();

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="text-2xl">
            H2 Mathematics 9758: Foot of Perpendicular (Standard Method)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription>
              <strong>Standard Template:</strong> ① N lies on <Italic>l</Italic> → ② Find <Vec>AN</Vec> → ③ Apply <Vec>AN</Vec> ⊥ <Italic>l</Italic> → ④ Solve for λ → ⑤ Find <Vec>ON</Vec>
              <br />
              <span className="text-sm mt-2 block">💡 Tip: You can enter answers as fractions (e.g., 1/2) or decimals (e.g., 0.5)</span>
            </AlertDescription>
          </Alert>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">Step {currentStep + 1} of 5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border-2 border-indigo-300 shadow-md mb-6">
            <h3 className="font-bold text-xl mb-4 text-indigo-700">📝 Given</h3>
            <div className="space-y-3 text-gray-800">
              <div className="p-4 bg-blue-50 rounded">
                <p className="font-semibold mb-2">Point A:</p>
                <div className="flex items-center gap-2 text-lg">
                  <Vec>OA</Vec>
                  <span>=</span>
                  <VectorNotation x={pointA.x} y={pointA.y} z={pointA.z} />
                  <span className="ml-2 text-gray-600">or A({pointA.x}, {pointA.y}, {pointA.z})</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded">
                <p className="font-semibold mb-2">Line <Italic>l</Italic>:</p>
                <div className="flex items-center gap-2 text-lg flex-wrap">
                  <Italic>l</Italic>
                  <span>: <BoldVec>r</BoldVec> =</span>
                  <VectorNotation x={linePoint.x} y={linePoint.y} z={linePoint.z} />
                  <span>+ λ</span>
                  <VectorNotation x={direction.x} y={direction.y} z={direction.z} />
                  <span className="ml-2 text-sm text-gray-600">(where λ ∈ ℝ)</span>
                </div>
                <p className="mt-2 text-sm">where <BoldVec>a</BoldVec> = <VectorNotation x={linePoint.x} y={linePoint.y} z={linePoint.z} /> and <BoldVec>b</BoldVec> = <VectorNotation x={direction.x} y={direction.y} z={direction.z} /></p>
              </div>
              <div className="p-4 bg-amber-50 rounded border-l-4 border-amber-400">
                <p className="font-semibold">🎯 Find: The foot of perpendicular N from point A to line <Italic>l</Italic></p>
              </div>
            </div>
            <div className="flex gap-3 mt-4 flex-wrap">
              <button onClick={() => loadExample(0)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Example 1</button>
              <button onClick={() => loadExample(1)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Example 2</button>
              <button onClick={() => loadExample(2)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Example 3</button>
              <button onClick={resetProblem} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">Reset</button>
            </div>
          </div>

          {/* Step 0: Introduction */}
          {currentStep === 0 && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-300 shadow-md">
              <h3 className="font-bold text-2xl mb-4 text-green-800">📋 Standard Solution Method</h3>
              <div className="space-y-4 text-gray-800">
                <div className="p-4 bg-white rounded-lg border-l-4 border-green-500">
                  <p className="font-bold mb-2 text-lg">Step ① N lies on <Italic>l</Italic></p>
                  <p>Express <Vec>ON</Vec> = <BoldVec>a</BoldVec> + λ<BoldVec>b</BoldVec> for some λ ∈ ℝ</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold mb-2 text-lg">Step ② Find <Vec>AN</Vec></p>
                  <p>Calculate <Vec>AN</Vec> = <Vec>ON</Vec> - <Vec>OA</Vec> (in terms of λ)</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold mb-2 text-lg">Step ③ Apply perpendicular condition</p>
                  <p>Since <Vec>AN</Vec> ⊥ <Italic>l</Italic>, we have <Vec>AN</Vec> · <BoldVec>b</BoldVec> = 0</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                  <p className="font-bold mb-2 text-lg">Step ④ Solve for λ</p>
                  <p>Solve the equation from step ③ to find λ</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-l-4 border-indigo-500">
                  <p className="font-bold mb-2 text-lg">Step ⑤ Find <Vec>ON</Vec></p>
                  <p>Substitute λ back to get <Vec>ON</Vec> (position vector of N)</p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-6 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg shadow-md"
                >
                  Start Solution! →
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Find AN */}
          {currentStep === 1 && (
            <div className="p-6 bg-white rounded-lg border-2 border-green-300 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-green-700">①</span>
                <h3 className="font-bold text-xl text-green-800">N lies on <Italic>l</Italic>, so express <Vec>ON</Vec></h3>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg mb-4 space-y-3">
                <p className="font-semibold">Since N lies on line <Italic>l</Italic>:</p>
                <div className="flex items-center gap-2 text-lg">
                  <Vec>ON</Vec>
                  <span>=</span>
                  <BoldVec>a</BoldVec>
                  <span>+ λ</span>
                  <BoldVec>b</BoldVec>
                  <span className="text-sm text-gray-600 ml-2">for some λ ∈ ℝ</span>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <Vec>ON</Vec>
                  <span>=</span>
                  <VectorNotation x={linePoint.x} y={linePoint.y} z={linePoint.z} />
                  <span>+ λ</span>
                  <VectorNotation x={direction.x} y={direction.y} z={direction.z} />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-blue-700">②</span>
                <h3 className="font-bold text-xl text-blue-800">Find vector <Vec>AN</Vec></h3>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg mb-4 space-y-3">
                <div className="flex items-center gap-2 text-lg">
                  <Vec>AN</Vec>
                  <span>=</span>
                  <Vec>ON</Vec>
                  <span>-</span>
                  <Vec>OA</Vec>
                </div>
                <div className="flex items-center gap-2 text-lg flex-wrap">
                  <span>=</span>
                  <span>[</span>
                  <VectorNotation x={linePoint.x} y={linePoint.y} z={linePoint.z} />
                  <span>+ λ</span>
                  <VectorNotation x={direction.x} y={direction.y} z={direction.z} />
                  <span>]</span>
                  <span>-</span>
                  <VectorNotation x={pointA.x} y={pointA.y} z={pointA.z} />
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <span>= λ</span>
                  <VectorNotation x={direction.x} y={direction.y} z={direction.z} />
                  <span>-</span>
                  <VectorNotation x={pointA.x - linePoint.x} y={pointA.y - linePoint.y} z={pointA.z - linePoint.z} />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg mb-4 border-l-4 border-yellow-400">
                <p className="font-semibold mb-3">Calculate the components of <Vec>AN</Vec> when λ = {formatFraction(correct.lambda)}:</p>
              </div>

              {showHint[1] && (
                <div className="p-3 bg-blue-100 border border-blue-300 rounded mb-4">
                  <p className="font-semibold text-blue-800">💡 Hint:</p>
                  <p>Substitute λ = {formatFraction(correct.lambda)} into:</p>
                  <p>AN<sub>x</sub> = λ({direction.x}) - ({pointA.x - linePoint.x}) = {formatFraction(correct.lambda)}({direction.x}) - ({pointA.x - linePoint.x})</p>
                  <p>Similarly for y and z components.</p>
                </div>
              )}

              <p className="font-semibold mb-3">Enter the components of <Vec>AN</Vec>:</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <InputWithFeedback field="anx" label="AN_x =" placeholder="e.g., 1/2 or 0.5" />
                <InputWithFeedback field="any" label="AN_y =" placeholder="e.g., 1/2 or 0.5" />
                <InputWithFeedback field="anz" label="AN_z =" placeholder="e.g., 1/2 or 0.5" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStepSubmit(1)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md"
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setShowHint({...showHint, 1: !showHint[1]})}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-md"
                >
                  {showHint[1] ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Apply perpendicular condition */}
          {currentStep === 2 && (
            <div className="p-6 bg-white rounded-lg border-2 border-purple-300 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-purple-700">③</span>
                <h3 className="font-bold text-xl text-purple-800">Apply Perpendicular Condition: <Vec>AN</Vec> ⊥ <Italic>l</Italic></h3>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg mb-4 space-y-3">
                <p className="font-semibold text-lg">Since N is the foot of perpendicular:</p>
                <p className="text-lg"><Vec>AN</Vec> ⊥ <Italic>l</Italic></p>
                <p className="text-lg">Therefore: <Vec>AN</Vec> · <BoldVec>b</BoldVec> = 0</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg mb-4 space-y-3">
                <p className="font-semibold">We have (in terms of λ):</p>
                <div className="flex items-center gap-2 text-lg">
                  <Vec>AN</Vec>
                  <span>= λ</span>
                  <VectorNotation x={direction.x} y={direction.y} z={direction.z} />
                  <span>-</span>
                  <VectorNotation x={correct.diff_x} y={correct.diff_y} z={correct.diff_z} />
                </div>
                <p className="mt-3 font-semibold">Direction vector:</p>
                <div className="flex items-center gap-2 text-lg">
                  <BoldVec>b</BoldVec>
                  <span>=</span>
                  <VectorNotation x={direction.x} y={direction.y} z={direction.z} />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg mb-4 border-l-4 border-yellow-400">
                <p className="font-semibold mb-2">Calculate <Vec>AN</Vec> · <BoldVec>b</BoldVec>:</p>
                <p>[λ({direction.x}) - ({correct.diff_x})]({direction.x}) + [λ({direction.y}) - ({correct.diff_y})]({direction.y}) + [λ({direction.z}) - ({correct.diff_z})]({direction.z}) = 0</p>
                <p className="mt-2">Expanding:</p>
                <p>λ({direction.x * direction.x + direction.y * direction.y + direction.z * direction.z}) + ({correct.diff_x * direction.x + correct.diff_y * direction.y + correct.diff_z * direction.z}) = 0</p>
              </div>

              {showHint[2] && (
                <div className="p-3 bg-blue-100 border border-blue-300 rounded mb-4">
                  <p className="font-semibold text-blue-800">💡 Hint:</p>
                  <p>Expand the dot product and collect terms:</p>
                  <p>λ(<BoldVec>b</BoldVec> · <BoldVec>b</BoldVec>) + (difference · <BoldVec>b</BoldVec>) = 0</p>
                  <p>The constant term is: ({correct.diff_x})({direction.x}) + ({correct.diff_y})({direction.y}) + ({correct.diff_z})({direction.z})</p>
                </div>
              )}

              <p className="font-semibold mb-3">What is the constant term (coefficient that doesn't multiply λ)?</p>
              <div className="mb-4">
                <InputWithFeedback field="dotProduct" label="Constant term =" placeholder="e.g., -1 or -3/2" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStepSubmit(2)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md"
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setShowHint({...showHint, 2: !showHint[2]})}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-md"
                >
                  {showHint[2] ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Solve for λ */}
          {currentStep === 3 && (
            <div className="p-6 bg-white rounded-lg border-2 border-red-300 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-red-700">④</span>
                <h3 className="font-bold text-xl text-red-800">Solve for λ</h3>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg mb-4 space-y-3">
                <p className="font-semibold">From the equation <Vec>AN</Vec> · <BoldVec>b</BoldVec> = 0:</p>
                <p className="text-lg">λ({correct.bDotB}) + ({correct.diff_dot_b}) = 0</p>
                <p className="text-lg mt-2">Solve for λ:</p>
                <p className="text-lg">λ({correct.bDotB}) = {-correct.diff_dot_b}</p>
                <p className="text-xl font-semibold mt-2">λ = {-correct.diff_dot_b} / {correct.bDotB}</p>
              </div>

              {showHint[3] && (
                <div className="p-3 bg-blue-100 border border-blue-300 rounded mb-4">
                  <p className="font-semibold text-blue-800">💡 Hint:</p>
                  <p>Divide both sides by {correct.bDotB}:</p>
                  <p>λ = {-correct.diff_dot_b} / {correct.bDotB} = {formatFraction(correct.lambda)}</p>
                </div>
              )}

              <p className="font-semibold mb-3">Calculate the value of λ:</p>
              <div className="mb-4">
                <InputWithFeedback field="lambda" label="λ =" placeholder="e.g., 1/2 or -3/4" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStepSubmit(3)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md"
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setShowHint({...showHint, 3: !showHint[3]})}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-md"
                >
                  {showHint[3] ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Find ON */}
          {currentStep === 4 && (
            <div className="p-6 bg-white rounded-lg border-2 border-indigo-300 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-indigo-700">⑤</span>
                <h3 className="font-bold text-xl text-indigo-800">Find <Vec>ON</Vec> (Position Vector of N)</h3>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-lg mb-4 space-y-3">
                <p className="font-semibold">From Step ④: λ = {formatFraction(correct.lambda)}</p>
                <p className="font-semibold mt-3">Substitute into:</p>
                <div className="flex items-center gap-2 text-lg">
                  <Vec>ON</Vec>
                  <span>=</span>
                  <BoldVec>a</BoldVec>
                  <span>+ λ</span>
                  <BoldVec>b</BoldVec>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <Vec>ON</Vec>
                  <span>=</span>
                  <VectorNotation x={linePoint.x} y={linePoint.y} z={linePoint.z} />
                  <span>+ ({formatFraction(correct.lambda)})</span>
                  <VectorNotation x={direction.x} y={direction.y} z={direction.z} />
                </div>
              </div>

              {showHint[4] && (
                <div className="p-3 bg-blue-100 border border-blue-300 rounded mb-4">
                  <p className="font-semibold text-blue-800">💡 Hint:</p>
                  <p>Calculate each component:</p>
                  <p>N<sub>x</sub> = {linePoint.x} + ({formatFraction(correct.lambda)})({direction.x}) = {formatFraction(correct.nx)}</p>
                  <p>N<sub>y</sub> = {linePoint.y} + ({formatFraction(correct.lambda)})({direction.y}) = {formatFraction(correct.ny)}</p>
                  <p>N<sub>z</sub> = {linePoint.z} + ({formatFraction(correct.lambda)})({direction.z}) = {formatFraction(correct.nz)}</p>
                </div>
              )}

              <p className="font-semibold mb-3">Enter the coordinates of N:</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <InputWithFeedback field="nx" label="N_x =" placeholder="e.g., 1/2 or 0.5" />
                <InputWithFeedback field="ny" label="N_y =" placeholder="e.g., 1/2 or 0.5" />
                <InputWithFeedback field="nz" label="N_z =" placeholder="e.g., 1/2 or 0.5" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStepSubmit(4)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md"
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setShowHint({...showHint, 4: !showHint[4]})}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-md"
                >
                  {showHint[4] ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Completion */}
          {currentStep === 5 && (
            <div className="p-6 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border-2 border-green-400 shadow-lg">
              <h3 className="font-bold text-3xl mb-4 text-green-800">🎉 Solution Complete!</h3>
              
              <div className="p-6 bg-white rounded-lg mb-4 shadow-md">
                <h4 className="font-bold text-2xl mb-3 text-indigo-700">Final Answer:</h4>
                <div className="flex items-center gap-3 text-2xl">
                  <Vec>ON</Vec>
                  <span>=</span>
                  <VectorNotation x={formatFraction(correct.nx)} y={formatFraction(correct.ny)} z={formatFraction(correct.nz)} />
                </div>
                <p className="mt-3 text-lg">or <strong>N({formatFraction(correct.nx)}, {formatFraction(correct.ny)}, {formatFraction(correct.nz)})</strong></p>
              </div>

              <div className="p-4 bg-white rounded-lg mb-4">
                <h4 className="font-bold text-lg mb-3">📝 Solution Summary:</h4>
                <div className="space-y-2 text-gray-800">
                  <p>① N lies on <Italic>l</Italic>: <Vec>ON</Vec> = <BoldVec>a</BoldVec> + λ<BoldVec>b</BoldVec></p>
                  <p>② <Vec>AN</Vec> = <Vec>ON</Vec> - <Vec>OA</Vec> (in terms of λ)</p>
                  <p>③ <Vec>AN</Vec> ⊥ <Italic>l</Italic> means <Vec>AN</Vec> · <BoldVec>b</BoldVec> = 0</p>
                  <p>④ Solving gave: λ = {formatFraction(correct.lambda)}</p>
                  <p>⑤ Therefore: <Vec>ON</Vec> = ({formatFraction(correct.nx)}, {formatFraction(correct.ny)}, {formatFraction(correct.nz)})</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300 mb-4">
                <h4 className="font-bold text-lg mb-2 text-amber-800">💡 Key Learning Points:</h4>
                <ul className="space-y-2 text-gray-800">
                  <li>• The foot of perpendicular N always lies on the line</li>
                  <li>• Use position vectors (<Vec>ON</Vec>, <Vec>OA</Vec>) to express relationships</li>
                  <li>• The perpendicular condition <Vec>AN</Vec> · <BoldVec>b</BoldVec> = 0 is crucial</li>
                  <li>• Solve the resulting linear equation for λ</li>
                  <li>• Substitute λ back to find the position vector <Vec>ON</Vec></li>
                </ul>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button onClick={() => loadExample(0)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md">
                  Try Example 1
                </button>
                <button onClick={() => loadExample(1)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md">
                  Try Example 2
                </button>
                <button onClick={() => loadExample(2)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md">
                  Try Example 3
                </button>
                <button onClick={resetProblem} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md">
                  Start Over
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FootOfPerpendicularLearning;
