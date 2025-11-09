package com.braintrust.identity.unit.application.service;


import com.braintrust.identity.application.dtos.commands.CreatePersonCommand;
import com.braintrust.identity.application.dtos.commands.UpdateImageCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonAddressCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonInfoCommand;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.services.PersonApplicationService;
import com.braintrust.identity.domain.exceptions.PersonNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings; // Importación clave
import org.mockito.quality.Strictness; // Importación clave
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// CORRECCIÓN CLAVE: Aplicar la configuración de Mockito para el modo tolerante (Lenient)
@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
@DisplayName("PersonApplicationService Unit Tests")
class PersonApplicationServiceTest {

    @Mock
    private PersonRepository personRepository;

    @InjectMocks
    private PersonApplicationService service;

    private static final String VALID_FIRST_NAME = "John";
    private static final String VALID_LAST_NAME = "Doe";
    private static final String VALID_GENDER = "Male";
    private static final String VALID_PHONE = "+52 961 123 4567";

    // ========================================
    // ✅ CREATE PERSON TESTS
    // ========================================

    @Test
    @DisplayName("Should create person successfully")
    void shouldCreatePersonSuccessfully() {
        // Given
        CreatePersonCommand command = new CreatePersonCommand(
                VALID_FIRST_NAME,
                VALID_LAST_NAME,
                VALID_GENDER,
                VALID_PHONE
        );

        Person mockPerson = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        when(personRepository.save(any(Person.class)))
                .thenReturn(mockPerson);

        // When
        PersonId result = service.createPerson(command);

        // Then
        assertThat(result).isNotNull();
        verify(personRepository).save(any(Person.class));
    }

    // ========================================
    // ✅ UPDATE PERSONAL INFO TESTS
    // ========================================

    @Test
    @DisplayName("Should update personal info successfully")
    void shouldUpdatePersonalInfoSuccessfully() {
        // Given
        Person mockPerson = mock(Person.class);
        PersonId personId = PersonId.generate();
        when(mockPerson.getId()).thenReturn(personId); // Stub 1: ID

        UpdatePersonInfoCommand command = new UpdatePersonInfoCommand(
                personId.getValue(), "Jane", "Smith", "Female", "+52 961 999 8888"
        );

        when(personRepository.findById(any(PersonId.class)))
                .thenReturn(Optional.of(mockPerson)); // Stub 2: Find
        // Eliminamos el stub de save, ya que solo necesitamos verificar su llamada (no su retorno)

        // When
        service.updatePersonalInfo(command);

        // Then
        verify(personRepository).findById(any(PersonId.class));
        verify(personRepository).save(mockPerson); // Verificamos la llamada
        verify(mockPerson).updatePersonalInfo(
                "Jane", "Smith", "Female", "+52 961 999 8888"
        );
    }


    @Test
    @DisplayName("Should throw exception when updating non-existent person")
    void shouldThrowExceptionWhenUpdatingNonExistentPerson() {
        // Given
        UpdatePersonInfoCommand command = new UpdatePersonInfoCommand(
                "PERSON-999",
                "Jane",
                "Smith",
                "Female",
                "+52 961 999 8888"
        );

        when(personRepository.findById(any(PersonId.class)))
                .thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.updatePersonalInfo(command))
                .isInstanceOf(PersonNotFoundException.class);

        verify(personRepository, never()).save(any());
    }

    // ========================================
    // ✅ UPDATE ADDRESS TESTS
    // ========================================

    @Test
    @DisplayName("Should update address successfully")
    void shouldUpdateAddressSuccessfully() {
        // Given
        Person mockPerson = mock(Person.class);
        PersonId personId = PersonId.generate();
        when(mockPerson.getId()).thenReturn(personId); // Stub 1: ID

        UpdatePersonAddressCommand command = new UpdatePersonAddressCommand(
                personId.getValue(), "Calle Principal 123", "Centro", "Tuxtla Gutiérrez", "Chiapas", "29000"
        );

        when(personRepository.findById(any(PersonId.class)))
                .thenReturn(Optional.of(mockPerson)); // Stub 2: Find
        // Eliminamos el stub de save

        // When
        service.updateAddress(command);

        // Then
        verify(personRepository).findById(any(PersonId.class));
        verify(personRepository).save(mockPerson); // Verificamos la llamada
        verify(mockPerson).updateAddress(any(Address.class));
    }

    // ========================================
    // ✅ UPDATE IMAGE TESTS
    // ========================================

    @Test
    @DisplayName("Should update image successfully")
    void shouldUpdateImageSuccessfully() {
        // Given
        Person mockPerson = mock(Person.class);
        PersonId personId = PersonId.generate();
        when(mockPerson.getId()).thenReturn(personId); // Stub 1: ID

        UpdateImageCommand command = new UpdateImageCommand(
                personId.getValue(), "/images/john-doe.jpg"
        );

        when(personRepository.findById(any(PersonId.class)))
                .thenReturn(Optional.of(mockPerson)); // Stub 2: Find
        // Eliminamos el stub de save

        // When
        service.updateImage(command);

        // Then
        verify(personRepository).findById(any(PersonId.class));
        verify(personRepository).save(mockPerson); // Verificamos la llamada
        verify(mockPerson).updateImage("/images/john-doe.jpg");
    }
    // ========================================
    // ✅ GET PERSON TESTS
    // ========================================

    @Test
    @DisplayName("Should get person by ID successfully")
    void shouldGetPersonByIdSuccessfully() {
        // Para este test de consulta, necesitamos un objeto real o un mock con TODOS los getters stubeados.
        // Usaremos un objeto real para simular la devolución del repositorio y probar el mapeo a DTO.
        // Pero primero, nos aseguramos de que Person.create/updatePersonalInfo no falle.
        Person realPerson = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        // Note: Tu código de dominio Person.updatePersonalInfo debe existir y no fallar
        // Aquí no podemos usar verify(realPerson)... porque no es un mock.
        realPerson.updatePersonalInfo(VALID_FIRST_NAME, VALID_LAST_NAME, VALID_GENDER, VALID_PHONE);

        when(personRepository.findById(any(PersonId.class)))
                .thenReturn(Optional.of(realPerson)); // Devolvemos el objeto real

        // When
        PersonDTO result = service.getPersonById(realPerson.getId());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo(VALID_FIRST_NAME);
        assertThat(result.lastName()).isEqualTo(VALID_LAST_NAME);
        verify(personRepository).findById(any(PersonId.class));
    }

    @Test
    @DisplayName("Should throw exception when person not found by ID")
    void shouldThrowExceptionWhenPersonNotFoundById() {
        // Given
        PersonId personId = PersonId.generate();
        when(personRepository.findById(personId))
                .thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.getPersonById(personId))
                .isInstanceOf(PersonNotFoundException.class);
    }

    @Test
    @DisplayName("Should get all persons")
    void shouldGetAllPersons() {
        // Given
        Person person1 = Person.create("John", "Doe");
        Person person2 = Person.create("Jane", "Smith");

        when(personRepository.findAll())
                .thenReturn(List.of(person1, person2));

        // When
        List<PersonDTO> results = service.getAllPersons();

        // Then
        assertThat(results).hasSize(2);
        verify(personRepository).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no persons exist")
    void shouldReturnEmptyListWhenNoPersonsExist() {
        // Given
        when(personRepository.findAll())
                .thenReturn(List.of());

        // When
        List<PersonDTO> results = service.getAllPersons();

        // Then
        assertThat(results).isEmpty();
        verify(personRepository).findAll();
    }
}