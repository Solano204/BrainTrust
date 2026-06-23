package com.braintrust.education.application.helpers.course;

import com.braintrust.education.application.dtos.commands.AddUnitCommand;
import com.braintrust.education.application.dtos.commands.AddUnitWithImageCommand;
import com.braintrust.education.application.dtos.commands.UpdateUnitCommand;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class CourseUnitHelper {

    private static final Logger log = LoggerFactory.getLogger(CourseUnitHelper.class);

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    public CourseUnitHelper(CourseRepository courseRepository, CourseMapper courseMapper) {
        this.courseRepository = courseRepository;
        this.courseMapper = courseMapper;
    }

    public UnitId addUnit(AddUnitCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        log.info("Adding Unit '{}' to Course ID {}", command.name(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        CourseUnit unit = course.addUnit(
                command.name(),
                command.order(),
                command.description()
        );

        courseRepository.save(course);
        log.info("Unit ID {} added successfully.", unit.getId().getValue());

        return unit.getId();
    }

    public UnitId addUnitWithImage(AddUnitWithImageCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        log.info("Adding Unit '{}' with image to Course ID {}", command.name(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        CourseUnit unit = course.addUnitWithImage(
                command.name(),
                command.order(),
                command.description(),
                command.imageUrl()
        );

        courseRepository.save(course);
        log.info("Unit ID {} (with image) added successfully.", unit.getId().getValue());

        return unit.getId();
    }

    public CourseUnitDTO getUnitById(UnitId unitId) {
        log.debug("Getting unit by ID: {}", unitId.getValue());
        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Unit not found in course"));

        return courseMapper.mapToUnitDTO(unit);
    }

    public void updateUnit(UpdateUnitCommand command) {
        UnitId unitId = UnitId.fromString(command.unitId());
        log.info("Updating Unit ID: {}", unitId.getValue());

        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Attempted to update Unit ID {} but it was not found in the course aggregate.",
                            unitId.getValue());
                    return new IllegalStateException("Unit not found in course");
                });

        unit.updateDetails(command.name(), command.description());
        unit.setUrlImage(command.urlImage());

        courseRepository.save(course);
        log.debug("Unit ID {} details updated.", unitId.getValue());
    }

    public void updateUnitImage(UnitId unitId, String imageUrl) {
        log.info("Updating image for Unit ID: {}", unitId.getValue());
        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Attempted to update image for Unit ID {} but it was not found in the course aggregate.",
                            unitId.getValue());
                    return new IllegalStateException("Unit not found in course");
                });

        unit.setUrlImage(imageUrl);

        courseRepository.save(course);
        log.debug("Unit ID {} image updated.", unitId.getValue());
    }

    public void deleteUnit(UnitId unitId) {
        log.warn("Deleting Unit ID: {} with cascade", unitId.getValue());

        Course course = findCourseByUnitIdOrThrow(unitId);

        boolean removed = course.removeUnit(unitId);

        if (removed) {
            courseRepository.save(course);
            log.info("Unit ID {} deleted successfully from Course ID {}",
                    unitId.getValue(), course.getId().getValue());
        } else {
            log.error("Unit ID {} not found in Course ID {}",
                    unitId.getValue(), course.getId().getValue());
            throw new IllegalStateException("Unit not found in course");
        }
    }

    public List<CourseUnitDTO> getCourseUnits(CourseId courseId) {
        log.debug("Fetching unit list for Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);

        return course.getUnits().stream()
                .map(courseMapper::mapToUnitDTO)
                .collect(Collectors.toList());
    }

    private Course findCourseByIdOrThrow(CourseId courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found with ID: {}", courseId.getValue());
                    return new CourseNotFoundException("Course not found: " + courseId.getValue());
                });
    }

    private Course findCourseByUnitIdOrThrow(UnitId unitId) {
        return courseRepository.findByUnitId(unitId)
                .orElseThrow(() -> {
                    log.warn("Course not found containing Unit ID: {}", unitId.getValue());
                    return new CourseNotFoundException("Course not found for unit: " + unitId.getValue());
                });
    }
}