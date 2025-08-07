# System Dynamics Tools Specification

## Overview

This document specifies a suite of tools designed to support reasoning processes and structured inquiries in system dynamics. These tools facilitate the analysis, modeling, and understanding of complex systems with feedback loops, delays, and non-linear behaviors.

## Tool Specifications

### 1. Causal Loop Diagram Builder (`build_causal_loop`)

**Purpose**: Create and analyze causal loop diagrams to visualize feedback relationships in complex systems.

**Parameters**:
```json
{
  "variables": {
    "type": "array",
    "description": "List of system variables/elements",
    "items": {
      "name": "string",
      "description": "string",
      "type": "enum: ['stock', 'flow', 'auxiliary', 'constant']"
    }
  },
  "relationships": {
    "type": "array",
    "description": "Causal relationships between variables",
    "items": {
      "from": "string",
      "to": "string",
      "polarity": "enum: ['positive', 'negative']",
      "delay": "boolean",
      "strength": "enum: ['weak', 'moderate', 'strong']"
    }
  },
  "analyze_loops": {
    "type": "boolean",
    "description": "Whether to identify and analyze feedback loops",
    "default": true
  }
}
```

**Returns**:
- Identified feedback loops (reinforcing/balancing)
- Loop dominance analysis
- System leverage points
- Visual diagram representation
- Stability assessment

### 2. Stock and Flow Modeler (`create_stock_flow_model`)

**Purpose**: Build quantitative stock and flow models for system dynamics simulation.

**Parameters**:
```json
{
  "stocks": {
    "type": "array",
    "description": "System stocks (accumulations)",
    "items": {
      "name": "string",
      "initial_value": "number",
      "units": "string",
      "constraints": {
        "min": "number",
        "max": "number"
      }
    }
  },
  "flows": {
    "type": "array",
    "description": "Rates of change between stocks",
    "items": {
      "name": "string",
      "from_stock": "string | null",
      "to_stock": "string | null",
      "equation": "string",
      "units": "string"
    }
  },
  "auxiliaries": {
    "type": "array",
    "description": "Helper variables and converters",
    "items": {
      "name": "string",
      "equation": "string",
      "units": "string"
    }
  },
  "time_settings": {
    "start": "number",
    "end": "number",
    "dt": "number",
    "units": "string"
  }
}
```

**Returns**:
- Model structure validation
- Unit consistency check
- Differential equations
- Initial equilibrium analysis
- Model complexity metrics

### 3. System Behavior Pattern Analyzer (`analyze_system_behavior`)

**Purpose**: Identify and classify common system behavior patterns in time series data or model outputs.

**Parameters**:
```json
{
  "data": {
    "type": "object",
    "description": "Time series data or model output",
    "properties": {
      "time": "array<number>",
      "variables": {
        "type": "object",
        "additionalProperties": "array<number>"
      }
    }
  },
  "patterns_to_detect": {
    "type": "array",
    "description": "Specific patterns to look for",
    "items": "enum: ['exponential_growth', 'exponential_decay', 's_curve', 'oscillation', 'overshoot', 'collapse', 'steady_state', 'chaos']",
    "default": ["all"]
  },
  "sensitivity_threshold": {
    "type": "number",
    "description": "Sensitivity for pattern detection (0-1)",
    "default": 0.8
  }
}
```

**Returns**:
- Detected behavior patterns with confidence scores
- Pattern parameters (growth rates, oscillation periods, etc.)
- Phase space analysis
- Stability regions
- Bifurcation points

### 4. Feedback Loop Analyzer (`analyze_feedback_loops`)

**Purpose**: Deep analysis of feedback loop structures and their influence on system behavior.

**Parameters**:
```json
{
  "model": {
    "type": "object",
    "description": "Reference to causal loop or stock-flow model"
  },
  "focus_variables": {
    "type": "array",
    "description": "Variables to focus analysis on",
    "items": "string",
    "optional": true
  },
  "analysis_type": {
    "type": "array",
    "items": "enum: ['loop_gain', 'time_constants', 'dominance_shift', 'sensitivity']",
    "default": ["all"]
  },
  "perturbation_size": {
    "type": "number",
    "description": "Size of perturbations for sensitivity analysis",
    "default": 0.1
  }
}
```

**Returns**:
- Loop gain calculations
- Time constants for each loop
- Conditions for dominance shifts
- Sensitivity matrices
- Critical parameter values

### 5. System Archetype Identifier (`identify_system_archetype`)

**Purpose**: Identify common system archetypes in a given model or problem description.

**Parameters**:
```json
{
  "model_structure": {
    "type": "object",
    "description": "Causal structure or model description"
  },
  "behavioral_data": {
    "type": "object",
    "description": "Optional time series data",
    "optional": true
  },
  "archetypes_to_check": {
    "type": "array",
    "items": "enum: ['limits_to_growth', 'shifting_the_burden', 'tragedy_of_commons', 'success_to_successful', 'fixes_that_fail', 'accidental_adversaries', 'growth_and_underinvestment', 'escalation']",
    "default": ["all"]
  }
}
```

**Returns**:
- Identified archetypes with match confidence
- Key variables for each archetype
- Intervention points
- Policy recommendations
- Historical examples

### 6. Delay Structure Analyzer (`analyze_delays`)

**Purpose**: Analyze delay structures in systems and their impact on dynamics.

**Parameters**:
```json
{
  "model": {
    "type": "object",
    "description": "System model with delays"
  },
  "delay_types": {
    "type": "array",
    "items": "enum: ['information', 'material', 'perception', 'decision', 'implementation']",
    "default": ["all"]
  },
  "analysis_methods": {
    "type": "array",
    "items": "enum: ['order_estimation', 'variability_impact', 'phase_shift', 'stability_margins']",
    "default": ["all"]
  }
}
```

**Returns**:
- Delay order estimates
- Total system delays
- Phase relationships
- Stability margins with delays
- Oscillation tendency analysis

### 7. Policy Structure Generator (`generate_policy_structure`)

**Purpose**: Generate and test policy structures for system intervention.

**Parameters**:
```json
{
  "system_model": {
    "type": "object",
    "description": "Base system model"
  },
  "objectives": {
    "type": "array",
    "description": "Policy objectives",
    "items": {
      "variable": "string",
      "target_behavior": "enum: ['stabilize', 'increase', 'decrease', 'oscillate_dampen']",
      "constraints": "object"
    }
  },
  "policy_types": {
    "type": "array",
    "items": "enum: ['proportional', 'integral', 'derivative', 'threshold', 'adaptive', 'rule_based']",
    "default": ["proportional", "integral"]
  },
  "test_scenarios": {
    "type": "array",
    "description": "Scenarios to test policies against"
  }
}
```

**Returns**:
- Generated policy structures
- Performance metrics
- Robustness analysis
- Side effects assessment
- Implementation complexity

### 8. System Boundary Analyzer (`analyze_system_boundary`)

**Purpose**: Analyze and optimize system boundaries for modeling purposes.

**Parameters**:
```json
{
  "system_description": {
    "type": "string",
    "description": "Natural language description of the system"
  },
  "current_boundary": {
    "type": "object",
    "description": "Current system boundary definition",
    "properties": {
      "included_elements": "array<string>",
      "excluded_elements": "array<string>",
      "boundary_flows": "array<object>"
    }
  },
  "analysis_criteria": {
    "type": "array",
    "items": "enum: ['completeness', 'closure', 'purpose_alignment', 'data_availability', 'complexity']",
    "default": ["all"]
  }
}
```

**Returns**:
- Boundary adequacy assessment
- Suggested inclusions/exclusions
- Boundary flow analysis
- Exogenous variable identification
- Model purpose alignment score

### 9. Equilibrium and Stability Analyzer (`analyze_equilibrium`)

**Purpose**: Find and analyze equilibrium points and stability characteristics.

**Parameters**:
```json
{
  "model": {
    "type": "object",
    "description": "System dynamics model"
  },
  "analysis_type": {
    "type": "array",
    "items": "enum: ['steady_state', 'dynamic_equilibrium', 'limit_cycles', 'strange_attractors']",
    "default": ["steady_state", "dynamic_equilibrium"]
  },
  "stability_tests": {
    "type": "array",
    "items": "enum: ['linear', 'lyapunov', 'structural', 'numerical']",
    "default": ["linear", "numerical"]
  },
  "parameter_ranges": {
    "type": "object",
    "description": "Parameter ranges for stability analysis",
    "additionalProperties": {
      "min": "number",
      "max": "number"
    }
  }
}
```

**Returns**:
- Equilibrium points
- Stability classifications
- Basin of attraction
- Bifurcation diagrams
- Critical parameter values

### 10. Model Validation Suite (`validate_sd_model`)

**Purpose**: Comprehensive validation of system dynamics models.

**Parameters**:
```json
{
  "model": {
    "type": "object",
    "description": "System dynamics model to validate"
  },
  "validation_tests": {
    "type": "array",
    "items": "enum: ['structure_verification', 'dimensional_consistency', 'boundary_adequacy', 'extreme_conditions', 'integration_error', 'behavior_reproduction', 'sensitivity_analysis', 'policy_sensitivity']",
    "default": ["all"]
  },
  "reference_data": {
    "type": "object",
    "description": "Historical or reference data for validation",
    "optional": true
  },
  "acceptance_criteria": {
    "type": "object",
    "description": "Criteria for validation pass/fail"
  }
}
```

**Returns**:
- Validation report by test type
- Confidence scores
- Failed test details
- Improvement suggestions
- Model quality metrics

## Integration Guidelines

### Tool Chaining
These tools are designed to work together in sequences:

1. **Problem Structuring Flow**:
   - `analyze_system_boundary` → `build_causal_loop` → `identify_system_archetype`

2. **Quantitative Modeling Flow**:
   - `build_causal_loop` → `create_stock_flow_model` → `analyze_equilibrium`

3. **Policy Design Flow**:
   - `analyze_feedback_loops` → `generate_policy_structure` → `validate_sd_model`

### Data Formats
All tools should support common SD data formats:
- Vensim (.mdl)
- Stella/iThink (.stm)
- Powersim (.sip)
- XMILE standard
- JSON-based interchange format

### Visualization Outputs
Each tool should provide:
- Interactive diagrams where applicable
- Time series plots
- Phase space diagrams
- Parameter sensitivity plots
- Confidence/uncertainty bands

## Error Handling

All tools should handle:
- Incomplete model specifications
- Numerical instabilities
- Circular dependencies
- Unit inconsistencies
- Missing data gracefully

## Performance Considerations

- Lazy evaluation for large models
- Caching of expensive calculations
- Parallel processing for sensitivity analyses
- Incremental updates for interactive use
- Memory-efficient sparse matrix operations for large systems